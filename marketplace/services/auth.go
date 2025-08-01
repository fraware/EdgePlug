package services

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"

	"github.com/edgeplug/marketplace/config"
	"github.com/edgeplug/marketplace/models"
)

// AuthService handles authentication and authorization
type AuthService struct {
	config *config.Config
	db     *gorm.DB
}

// NewAuthService creates a new auth service
func NewAuthService(cfg *config.Config, db *gorm.DB) *AuthService {
	return &AuthService{
		config: cfg,
		db:     db,
	}
}

// Claims represents JWT claims
type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	Email  string    `json:"email"`
	Role   string    `json:"role"`
	jwt.RegisteredClaims
}

// GenerateToken generates a JWT token for a user
func (s *AuthService) GenerateToken(userID uuid.UUID, email, role string) (string, error) {
	expirationTime := time.Now().Add(s.config.JWT.Expiration)

	claims := &Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    s.config.JWT.Issuer,
			Subject:   userID.String(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.config.JWT.Secret))
	if err != nil {
		return "", fmt.Errorf("failed to sign token: %w", err)
	}

	return tokenString, nil
}

// ValidateToken validates a JWT token and returns the claims
func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.config.JWT.Secret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

// GetUserByID retrieves a user by ID
func (s *AuthService) GetUserByID(userID uuid.UUID) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, userID).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByEmail retrieves a user by email
func (s *AuthService) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateUserLastLogin updates the user's last login timestamp
func (s *AuthService) UpdateUserLastLogin(userID uuid.UUID) error {
	return s.db.Model(&models.User{}).Where("id = ?", userID).Update("last_login_at", time.Now()).Error
}

// ValidateCredentials validates user credentials
func (s *AuthService) ValidateCredentials(email, password string) (*models.User, error) {
	user, err := s.GetUserByEmail(email)
	if err != nil {
		return nil, err
	}

	// Check if user is active
	if user.Status != models.UserStatusActive {
		return nil, fmt.Errorf("user account is not active")
	}

	// Validate password (this would typically use bcrypt)
	// For now, we'll assume the password is already hashed in the database
	// In a real implementation, you would compare the hashed password

	return user, nil
}

// RefreshToken generates a new token for a user
func (s *AuthService) RefreshToken(userID uuid.UUID) (string, error) {
	user, err := s.GetUserByID(userID)
	if err != nil {
		return "", fmt.Errorf("user not found: %w", err)
	}

	return s.GenerateToken(user.ID, user.Email, string(user.Role))
}

// RevokeToken revokes a token (in a real implementation, you would store revoked tokens)
func (s *AuthService) RevokeToken(tokenString string) error {
	// In a production environment, you would store revoked tokens in Redis or database
	// For now, we'll just log the revocation
	log.Info().Msgf("Token revoked: %s", tokenString)
	return nil
}

// CheckPermission checks if a user has a specific permission
func (s *AuthService) CheckPermission(userID uuid.UUID, permission string) (bool, error) {
	user, err := s.GetUserByID(userID)
	if err != nil {
		return false, err
	}

	// Simple permission check based on role
	switch permission {
	case "admin":
		return user.Role == models.UserRoleAdmin, nil
	case "publisher":
		return user.Role == models.UserRolePublisher || user.Role == models.UserRoleAdmin, nil
	case "user":
		return true, nil
	default:
		return false, nil
	}
}

// RequireRole middleware function to check user role
func (s *AuthService) RequireRole(requiredRole models.UserRole) func(*gin.Context) {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		user, err := s.GetUserByID(userID.(uuid.UUID))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			c.Abort()
			return
		}

		// Check if user has required role
		if user.Role != requiredRole && user.Role != models.UserRoleAdmin {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequirePermission middleware function to check user permission
func (s *AuthService) RequirePermission(permission string) func(*gin.Context) {
	return func(c *gin.Context) {
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		hasPermission, err := s.CheckPermission(userID.(uuid.UUID), permission)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
			c.Abort()
			return
		}

		if !hasPermission {
			c.JSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			c.Abort()
			return
		}

		c.Next()
	}
}
