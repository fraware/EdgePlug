package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/edgeplug/marketplace/config"
	"github.com/edgeplug/marketplace/models"
	"github.com/edgeplug/marketplace/services"
)

// Handler holds all HTTP handlers
type Handler struct {
	config   *config.Config
	db       *gorm.DB
	authSvc  *services.AuthService
	agentSvc *services.AgentService
	userSvc  *services.UserService
}

// NewHandler creates a new handler instance
func NewHandler(cfg *config.Config, db *gorm.DB) *Handler {
	authSvc := services.NewAuthService(cfg, db)
	agentSvc := services.NewAgentService(db)
	userSvc := services.NewUserService(db)

	return &Handler{
		config:   cfg,
		db:       db,
		authSvc:  authSvc,
		agentSvc: agentSvc,
		userSvc:  userSvc,
	}
}

// HealthCheck handles health check requests
func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"timestamp": time.Now().UTC(),
		"version":   "1.0.0",
	})
}

// Register handles user registration
func (h *Handler) Register(c *gin.Context) {
	var req struct {
		Email     string `json:"email" binding:"required,email"`
		Username  string `json:"username" binding:"required,min=3,max=50"`
		Password  string `json:"password" binding:"required,min=8"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Company   string `json:"company"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := h.db.Where("email = ? OR username = ?", req.Email, req.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Error().Err(err).Msg("Failed to hash password")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// Create user
	user := models.User{
		Email:        req.Email,
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Company:      req.Company,
		Role:         models.UserRoleUser,
		Status:       models.UserStatusActive,
	}

	if err := h.db.Create(&user).Error; err != nil {
		log.Error().Err(err).Msg("Failed to create user")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate JWT token
	token, err := h.authSvc.GenerateToken(user.ID, user.Email, string(user.Role))
	if err != nil {
		log.Error().Err(err).Msg("Failed to generate token")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"username":   user.Username,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"role":       user.Role,
		},
		"token": token,
	})
}

// Login handles user authentication
func (h *Handler) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user
	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		log.Error().Err(err).Msg("Database error during login")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check if user is active
	if user.Status != models.UserStatusActive {
		c.JSON(http.StatusForbidden, gin.H{"error": "Account is not active"})
		return
	}

	// Generate JWT token
	token, err := h.authSvc.GenerateToken(user.ID, user.Email, string(user.Role))
	if err != nil {
		log.Error().Err(err).Msg("Failed to generate token")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"username":   user.Username,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"role":       user.Role,
		},
		"token": token,
	})
}

// GetProfile returns the current user's profile
func (h *Handler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		log.Error().Err(err).Msg("Database error getting profile")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"username":   user.Username,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"company":    user.Company,
			"role":       user.Role,
			"status":     user.Status,
			"verified":   user.Verified,
			"created_at": user.CreatedAt,
		},
	})
}

// UpdateProfile updates the current user's profile
func (h *Handler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Company   string `json:"company"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update user
	updates := map[string]interface{}{
		"first_name": req.FirstName,
		"last_name":  req.LastName,
		"company":    req.Company,
	}

	if err := h.db.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
		log.Error().Err(err).Msg("Failed to update profile")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

// GetAgents returns a list of agents with filtering and pagination
func (h *Handler) GetAgents(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	category := c.Query("category")
	status := c.Query("status")
	search := c.Query("search")
	sortBy := c.DefaultQuery("sort", "created_at")
	sortOrder := c.DefaultQuery("order", "desc")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	query := h.db.Model(&models.Agent{}).Where("deleted_at IS NULL")

	// Apply filters
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	// Apply sorting
	if sortOrder == "asc" {
		query = query.Order(fmt.Sprintf("%s ASC", sortBy))
	} else {
		query = query.Order(fmt.Sprintf("%s DESC", sortBy))
	}

	var agents []models.Agent
	var total int64

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		log.Error().Err(err).Msg("Failed to count agents")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// Get agents with pagination
	if err := query.Offset(offset).Limit(limit).Preload("Publisher").Find(&agents).Error; err != nil {
		log.Error().Err(err).Msg("Failed to get agents")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"agents": agents,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (int(total) + limit - 1) / limit,
		},
	})
}

// GetAgent returns a specific agent by ID
func (h *Handler) GetAgent(c *gin.Context) {
	agentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid agent ID"})
		return
	}

	var agent models.Agent
	if err := h.db.Preload("Publisher").Preload("Reviews.User").First(&agent, agentID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
			return
		}
		log.Error().Err(err).Msg("Database error getting agent")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// Increment download count
	h.db.Model(&agent).UpdateColumn("downloads", gorm.Expr("downloads + ?", 1))

	c.JSON(http.StatusOK, gin.H{"agent": agent})
}

// CreateAgent creates a new agent
func (h *Handler) CreateAgent(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		Name        string   `json:"name" binding:"required"`
		Description string   `json:"description"`
		Version     string   `json:"version" binding:"required"`
		Category    string   `json:"category" binding:"required"`
		Tags        []string `json:"tags"`
		Price       float64  `json:"price"`
		Currency    string   `json:"currency"`
		FlashSize   int      `json:"flash_size"`
		SRAMSize    int      `json:"sram_size"`
		MaxLatency  int      `json:"max_latency"`
		SafetyLevel string   `json:"safety_level"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	agent := models.Agent{
		Name:        req.Name,
		Description: req.Description,
		Version:     req.Version,
		PublisherID: userID.(uuid.UUID),
		Category:    req.Category,
		Tags:        req.Tags,
		Price:       req.Price,
		Currency:    req.Currency,
		FlashSize:   req.FlashSize,
		SRAMSize:    req.SRAMSize,
		MaxLatency:  req.MaxLatency,
		SafetyLevel: models.SafetyLevel(req.SafetyLevel),
		Status:      models.AgentStatusDraft,
	}

	if err := h.db.Create(&agent).Error; err != nil {
		log.Error().Err(err).Msg("Failed to create agent")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create agent"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Agent created successfully",
		"agent":   agent,
	})
}

// UpdateAgent updates an existing agent
func (h *Handler) UpdateAgent(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	agentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid agent ID"})
		return
	}

	// Check if agent exists and belongs to user
	var agent models.Agent
	if err := h.db.Where("id = ? AND publisher_id = ?", agentID, userID).First(&agent).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
			return
		}
		log.Error().Err(err).Msg("Database error getting agent")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	var req struct {
		Name        string   `json:"name"`
		Description string   `json:"description"`
		Version     string   `json:"version"`
		Category    string   `json:"category"`
		Tags        []string `json:"tags"`
		Price       float64  `json:"price"`
		Currency    string   `json:"currency"`
		FlashSize   int      `json:"flash_size"`
		SRAMSize    int      `json:"sram_size"`
		MaxLatency  int      `json:"max_latency"`
		SafetyLevel string   `json:"safety_level"`
		Status      string   `json:"status"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{
		"name":         req.Name,
		"description":  req.Description,
		"version":      req.Version,
		"category":     req.Category,
		"tags":         req.Tags,
		"price":        req.Price,
		"currency":     req.Currency,
		"flash_size":   req.FlashSize,
		"sram_size":    req.SRAMSize,
		"max_latency":  req.MaxLatency,
		"safety_level": req.SafetyLevel,
		"status":       req.Status,
	}

	if req.Status == string(models.AgentStatusPublished) && agent.Status != models.AgentStatusPublished {
		now := time.Now()
		updates["published_at"] = &now
	}

	if err := h.db.Model(&agent).Updates(updates).Error; err != nil {
		log.Error().Err(err).Msg("Failed to update agent")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update agent"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Agent updated successfully",
		"agent":   agent,
	})
}

// DeleteAgent deletes an agent
func (h *Handler) DeleteAgent(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	agentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid agent ID"})
		return
	}

	// Check if agent exists and belongs to user
	var agent models.Agent
	if err := h.db.Where("id = ? AND publisher_id = ?", agentID, userID).First(&agent).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
			return
		}
		log.Error().Err(err).Msg("Database error getting agent")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	if err := h.db.Delete(&agent).Error; err != nil {
		log.Error().Err(err).Msg("Failed to delete agent")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete agent"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Agent deleted successfully"})
}

// CreateReview creates a review for an agent
func (h *Handler) CreateReview(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	agentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid agent ID"})
		return
	}

	var req struct {
		Rating  int    `json:"rating" binding:"required,min=1,max=5"`
		Comment string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user has already reviewed this agent
	var existingReview models.Review
	if err := h.db.Where("user_id = ? AND agent_id = ?", userID, agentID).First(&existingReview).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You have already reviewed this agent"})
		return
	}

	review := models.Review{
		UserID:  userID.(uuid.UUID),
		AgentID: agentID,
		Rating:  req.Rating,
		Comment: req.Comment,
	}

	if err := h.db.Create(&review).Error; err != nil {
		log.Error().Err(err).Msg("Failed to create review")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create review"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Review created successfully",
		"review":  review,
	})
}

// GetReviews returns reviews for an agent
func (h *Handler) GetReviews(c *gin.Context) {
	agentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid agent ID"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}

	offset := (page - 1) * limit

	var reviews []models.Review
	var total int64

	query := h.db.Model(&models.Review{}).Where("agent_id = ?", agentID)

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		log.Error().Err(err).Msg("Failed to count reviews")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// Get reviews with pagination
	if err := query.Offset(offset).Limit(limit).Preload("User").Order("created_at DESC").Find(&reviews).Error; err != nil {
		log.Error().Err(err).Msg("Failed to get reviews")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"reviews": reviews,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (int(total) + limit - 1) / limit,
		},
	})
}
