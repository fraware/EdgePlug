package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/pprof"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"github.com/edgeplug/marketplace/config"
	"github.com/edgeplug/marketplace/handlers"
	"github.com/edgeplug/marketplace/middleware"
	"github.com/edgeplug/marketplace/models"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load configuration")
	}

	// Setup logging
	setupLogging(cfg)

	// Connect to database
	db, err := connectDatabase(cfg)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}

	// Auto-migrate database
	if err := autoMigrate(db); err != nil {
		log.Fatal().Err(err).Msg("Failed to migrate database")
	}

	// Create handlers
	handler := handlers.NewHandler(cfg, db)

	// Setup router
	router := setupRouter(cfg, handler)

	// Create server
	server := &http.Server{
		Addr:         fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port),
		Handler:      router,
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  cfg.Server.IdleTimeout,
	}

	// Start server in a goroutine
	go func() {
		log.Info().Msgf("Starting server on %s:%s", cfg.Server.Host, cfg.Server.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("Failed to start server")
		}
	}()

	// Start metrics server if enabled
	if cfg.Metrics.Enabled {
		go startMetricsServer(cfg)
	}

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info().Msg("Shutting down server...")

	// Create a deadline for server shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatal().Err(err).Msg("Server forced to shutdown")
	}

	log.Info().Msg("Server exited")
}

// setupLogging configures the logging system
func setupLogging(cfg *config.Config) {
	// Set log level
	level, err := zerolog.ParseLevel(cfg.Logging.Level)
	if err != nil {
		level = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(level)

	// Set log format
	if cfg.Logging.Format == "console" {
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})
	} else {
		// JSON format is default
		log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr, NoColor: true})
	}

	// Set time format
	zerolog.TimeFieldFormat = time.RFC3339
}

// connectDatabase connects to the PostgreSQL database
func connectDatabase(cfg *config.Config) (*gorm.DB, error) {
	dsn := cfg.Database.GetDSN()

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	sqlDB.SetMaxOpenConns(cfg.Database.MaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.Database.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(cfg.Database.ConnMaxLifetime)

	// Test connection
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Info().Msg("Database connected successfully")
	return db, nil
}

// autoMigrate runs database migrations
func autoMigrate(db *gorm.DB) error {
	models := []interface{}{
		&models.User{},
		&models.Agent{},
		&models.Purchase{},
		&models.Review{},
		&models.Favorite{},
		&models.Transaction{},
	}

	for _, model := range models {
		if err := db.AutoMigrate(model); err != nil {
			return fmt.Errorf("failed to migrate %T: %w", model, err)
		}
	}

	log.Info().Msg("Database migrations completed")
	return nil
}

// setupRouter configures the HTTP router with middleware and routes
func setupRouter(cfg *config.Config, handler *handlers.Handler) *gin.Engine {
	// Set Gin mode
	if cfg.Logging.Level == "debug" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()

	// Add middleware
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS(cfg.Security.CORSOrigins))

	// Add pprof endpoints in debug mode
	if cfg.Logging.Level == "debug" {
		pprof.Register(router)
	}

	// Health check endpoint
	router.GET("/health", handler.HealthCheck)

	// API routes
	api := router.Group("/api/v1")
	{
		// Public routes
		api.POST("/auth/register", handler.Register)
		api.POST("/auth/login", handler.Login)

		// Agent routes (public)
		api.GET("/agents", handler.GetAgents)
		api.GET("/agents/:id", handler.GetAgent)
		api.GET("/agents/:id/reviews", handler.GetReviews)

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.Auth(cfg))
		{
			// User routes
			protected.GET("/profile", handler.GetProfile)
			protected.PUT("/profile", handler.UpdateProfile)

			// Agent management (publishers only)
			protected.POST("/agents", handler.CreateAgent)
			protected.PUT("/agents/:id", handler.UpdateAgent)
			protected.DELETE("/agents/:id", handler.DeleteAgent)

			// Reviews
			protected.POST("/agents/:id/reviews", handler.CreateReview)
		}

		// Admin routes
		admin := api.Group("/admin")
		admin.Use(middleware.Auth(cfg))
		admin.Use(middleware.RequireRole(models.UserRoleAdmin))
		{
			// Add admin-specific routes here
			admin.GET("/stats", handler.GetStats)
			admin.GET("/users", handler.GetUsers)
			admin.PUT("/users/:id/status", handler.UpdateUserStatus)
		}
	}

	// Swagger documentation
	if cfg.Logging.Level == "debug" {
		router.GET("/swagger/*any", gin.WrapH(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("Swagger documentation would be served here"))
		})))
	}

	return router
}

// startMetricsServer starts the Prometheus metrics server
func startMetricsServer(cfg *config.Config) {
	metricsMux := http.NewServeMux()
	metricsMux.Handle(cfg.Metrics.Path, promhttp.Handler())

	metricsServer := &http.Server{
		Addr:    fmt.Sprintf(":%s", cfg.Metrics.Port),
		Handler: metricsMux,
	}

	log.Info().Msgf("Starting metrics server on :%s", cfg.Metrics.Port)
	if err := metricsServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal().Err(err).Msg("Failed to start metrics server")
	}
}
