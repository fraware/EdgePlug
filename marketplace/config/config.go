package config

import (
	"fmt"
	"strings"
	"time"

	"github.com/spf13/viper"
)

// Config holds all configuration for the marketplace backend
type Config struct {
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	Redis    RedisConfig    `mapstructure:"redis"`
	JWT      JWTConfig      `mapstructure:"jwt"`
	Storage  StorageConfig  `mapstructure:"storage"`
	Security SecurityConfig  `mapstructure:"security"`
	Metrics  MetricsConfig  `mapstructure:"metrics"`
	Logging  LoggingConfig  `mapstructure:"logging"`
}

// ServerConfig holds server-specific configuration
type ServerConfig struct {
	Port         string        `mapstructure:"port"`
	Host         string        `mapstructure:"host"`
	ReadTimeout  time.Duration `mapstructure:"read_timeout"`
	WriteTimeout time.Duration `mapstructure:"write_timeout"`
	IdleTimeout  time.Duration `mapstructure:"idle_timeout"`
	MaxBodySize  int64         `mapstructure:"max_body_size"`
}

// DatabaseConfig holds database-specific configuration
type DatabaseConfig struct {
	Host            string `mapstructure:"host"`
	Port            int    `mapstructure:"port"`
	User            string `mapstructure:"user"`
	Password        string `mapstructure:"password"`
	DBName          string `mapstructure:"dbname"`
	SSLMode         string `mapstructure:"sslmode"`
	MaxOpenConns    int    `mapstructure:"max_open_conns"`
	MaxIdleConns    int    `mapstructure:"max_idle_conns"`
	ConnMaxLifetime time.Duration `mapstructure:"conn_max_lifetime"`
}

// RedisConfig holds Redis-specific configuration
type RedisConfig struct {
	Host     string `mapstructure:"host"`
	Port     int    `mapstructure:"port"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
}

// JWTConfig holds JWT-specific configuration
type JWTConfig struct {
	Secret     string        `mapstructure:"secret"`
	Expiration time.Duration `mapstructure:"expiration"`
	Issuer     string        `mapstructure:"issuer"`
}

// StorageConfig holds storage-specific configuration
type StorageConfig struct {
	Type     string `mapstructure:"type"` // "local", "s3", "minio"
	LocalDir string `mapstructure:"local_dir"`
	S3       S3Config `mapstructure:"s3"`
	MinIO    MinIOConfig `mapstructure:"minio"`
}

// S3Config holds AWS S3-specific configuration
type S3Config struct {
	Region          string `mapstructure:"region"`
	Bucket          string `mapstructure:"bucket"`
	AccessKeyID     string `mapstructure:"access_key_id"`
	SecretAccessKey string `mapstructure:"secret_access_key"`
}

// MinIOConfig holds MinIO-specific configuration
type MinIOConfig struct {
	Endpoint        string `mapstructure:"endpoint"`
	AccessKeyID     string `mapstructure:"access_key_id"`
	SecretAccessKey string `mapstructure:"secret_access_key"`
	UseSSL          bool   `mapstructure:"use_ssl"`
	Bucket          string `mapstructure:"bucket"`
}

// SecurityConfig holds security-specific configuration
type SecurityConfig struct {
	RateLimitRequests int           `mapstructure:"rate_limit_requests"`
	RateLimitWindow   time.Duration `mapstructure:"rate_limit_window"`
	CORSOrigins       []string      `mapstructure:"cors_origins"`
	AllowedHosts      []string      `mapstructure:"allowed_hosts"`
}

// MetricsConfig holds metrics-specific configuration
type MetricsConfig struct {
	Enabled bool   `mapstructure:"enabled"`
	Port    string `mapstructure:"port"`
	Path    string `mapstructure:"path"`
}

// LoggingConfig holds logging-specific configuration
type LoggingConfig struct {
	Level      string `mapstructure:"level"`
	Format     string `mapstructure:"format"` // "json", "console"
	OutputPath string `mapstructure:"output_path"`
}

// Load loads configuration from environment variables and config files
func Load() (*Config, error) {
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")
	viper.AddConfigPath("/etc/edgeplug/marketplace")

	// Set defaults
	setDefaults()

	// Read config file if it exists
	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("failed to read config file: %w", err)
		}
	}

	// Override with environment variables
	viper.AutomaticEnv()
	viper.SetEnvPrefix("EDGEPLUG")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// Validate configuration
	if err := validateConfig(&config); err != nil {
		return nil, fmt.Errorf("invalid configuration: %w", err)
	}

	return &config, nil
}

// setDefaults sets default values for configuration
func setDefaults() {
	// Server defaults
	viper.SetDefault("server.port", "8080")
	viper.SetDefault("server.host", "0.0.0.0")
	viper.SetDefault("server.read_timeout", "30s")
	viper.SetDefault("server.write_timeout", "30s")
	viper.SetDefault("server.idle_timeout", "60s")
	viper.SetDefault("server.max_body_size", 10*1024*1024) // 10MB

	// Database defaults
	viper.SetDefault("database.host", "localhost")
	viper.SetDefault("database.port", 5432)
	viper.SetDefault("database.user", "edgeplug")
	viper.SetDefault("database.dbname", "edgeplug_marketplace")
	viper.SetDefault("database.sslmode", "disable")
	viper.SetDefault("database.max_open_conns", 25)
	viper.SetDefault("database.max_idle_conns", 5)
	viper.SetDefault("database.conn_max_lifetime", "5m")

	// Redis defaults
	viper.SetDefault("redis.host", "localhost")
	viper.SetDefault("redis.port", 6379)
	viper.SetDefault("redis.db", 0)

	// JWT defaults
	viper.SetDefault("jwt.expiration", "24h")
	viper.SetDefault("jwt.issuer", "edgeplug-marketplace")

	// Storage defaults
	viper.SetDefault("storage.type", "local")
	viper.SetDefault("storage.local_dir", "./uploads")

	// Security defaults
	viper.SetDefault("security.rate_limit_requests", 100)
	viper.SetDefault("security.rate_limit_window", "1m")
	viper.SetDefault("security.cors_origins", []string{"*"})

	// Metrics defaults
	viper.SetDefault("metrics.enabled", true)
	viper.SetDefault("metrics.port", "9090")
	viper.SetDefault("metrics.path", "/metrics")

	// Logging defaults
	viper.SetDefault("logging.level", "info")
	viper.SetDefault("logging.format", "json")
}

// validateConfig validates the configuration
func validateConfig(config *Config) error {
	// Validate server config
	if config.Server.Port == "" {
		return fmt.Errorf("server port is required")
	}

	// Validate database config
	if config.Database.Host == "" {
		return fmt.Errorf("database host is required")
	}
	if config.Database.User == "" {
		return fmt.Errorf("database user is required")
	}
	if config.Database.DBName == "" {
		return fmt.Errorf("database name is required")
	}

	// Validate JWT config
	if config.JWT.Secret == "" {
		return fmt.Errorf("JWT secret is required")
	}

	// Validate storage config
	if config.Storage.Type == "" {
		return fmt.Errorf("storage type is required")
	}

	switch config.Storage.Type {
	case "local":
		if config.Storage.LocalDir == "" {
			return fmt.Errorf("local storage directory is required")
		}
	case "s3":
		if config.Storage.S3.Region == "" {
			return fmt.Errorf("S3 region is required")
		}
		if config.Storage.S3.Bucket == "" {
			return fmt.Errorf("S3 bucket is required")
		}
		if config.Storage.S3.AccessKeyID == "" {
			return fmt.Errorf("S3 access key ID is required")
		}
		if config.Storage.S3.SecretAccessKey == "" {
			return fmt.Errorf("S3 secret access key is required")
		}
	case "minio":
		if config.Storage.MinIO.Endpoint == "" {
			return fmt.Errorf("MinIO endpoint is required")
		}
		if config.Storage.MinIO.Bucket == "" {
			return fmt.Errorf("MinIO bucket is required")
		}
		if config.Storage.MinIO.AccessKeyID == "" {
			return fmt.Errorf("MinIO access key ID is required")
		}
		if config.Storage.MinIO.SecretAccessKey == "" {
			return fmt.Errorf("MinIO secret access key is required")
		}
	default:
		return fmt.Errorf("unsupported storage type: %s", config.Storage.Type)
	}

	return nil
}

// GetDSN returns the database connection string
func (c *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode)
}

// GetRedisAddr returns the Redis address
func (c *RedisConfig) GetRedisAddr() string {
	return fmt.Sprintf("%s:%d", c.Host, c.Port)
} 