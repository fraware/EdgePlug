package services

import (
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edgeplug/marketplace/models"
)

// UserService handles user-related business logic
type UserService struct {
	db *gorm.DB
}

// NewUserService creates a new user service
func NewUserService(db *gorm.DB) *UserService {
	return &UserService{db: db}
}

// CreateUser creates a new user
func (s *UserService) CreateUser(user *models.User) error {
	return s.db.Create(user).Error
}

// GetUserByID retrieves a user by ID
func (s *UserService) GetUserByID(id uuid.UUID) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByEmail retrieves a user by email
func (s *UserService) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByUsername retrieves a user by username
func (s *UserService) GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	if err := s.db.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// UpdateUser updates a user
func (s *UserService) UpdateUser(id uuid.UUID, updates map[string]interface{}) error {
	return s.db.Model(&models.User{}).Where("id = ?", id).Updates(updates).Error
}

// DeleteUser deletes a user (soft delete)
func (s *UserService) DeleteUser(id uuid.UUID) error {
	return s.db.Delete(&models.User{}, id).Error
}

// GetUsers retrieves users with filtering and pagination
func (s *UserService) GetUsers(page, limit int, filters map[string]interface{}) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	query := s.db.Model(&models.User{}).Where("deleted_at IS NULL")

	// Apply filters
	for key, value := range filters {
		if value != "" && value != nil {
			query = query.Where(key+" = ?", value)
		}
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get users with pagination
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

// UpdateUserStatus updates a user's status
func (s *UserService) UpdateUserStatus(id uuid.UUID, status models.UserStatus) error {
	updates := map[string]interface{}{
		"status": status,
	}
	return s.UpdateUser(id, updates)
}

// UpdateUserRole updates a user's role
func (s *UserService) UpdateUserRole(id uuid.UUID, role models.UserRole) error {
	updates := map[string]interface{}{
		"role": role,
	}
	return s.UpdateUser(id, updates)
}

// VerifyUser marks a user as verified
func (s *UserService) VerifyUser(id uuid.UUID) error {
	updates := map[string]interface{}{
		"verified": true,
	}
	return s.UpdateUser(id, updates)
}

// GetUserStats returns statistics for a user
func (s *UserService) GetUserStats(id uuid.UUID) (map[string]interface{}, error) {
	var user models.User
	if err := s.db.First(&user, id).Error; err != nil {
		return nil, err
	}

	var agentCount int64
	var purchaseCount int64
	var reviewCount int64

	// Get agent count
	if err := s.db.Model(&models.Agent{}).Where("publisher_id = ?", id).Count(&agentCount).Error; err != nil {
		return nil, err
	}

	// Get purchase count
	if err := s.db.Model(&models.Purchase{}).Where("buyer_id = ?", id).Count(&purchaseCount).Error; err != nil {
		return nil, err
	}

	// Get review count
	if err := s.db.Model(&models.Review{}).Where("user_id = ?", id).Count(&reviewCount).Error; err != nil {
		return nil, err
	}

	stats := map[string]interface{}{
		"agents_published": agentCount,
		"purchases_made":   purchaseCount,
		"reviews_written":  reviewCount,
		"member_since":     user.CreatedAt,
		"verified":         user.Verified,
	}

	return stats, nil
}

// GetUserAgents gets all agents published by a user
func (s *UserService) GetUserAgents(userID uuid.UUID, page, limit int) ([]models.Agent, int64, error) {
	var agents []models.Agent
	var total int64

	query := s.db.Model(&models.Agent{}).Where("publisher_id = ? AND deleted_at IS NULL", userID)

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get agents with pagination
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&agents).Error; err != nil {
		return nil, 0, err
	}

	return agents, total, nil
}

// GetUserPurchases gets all purchases made by a user
func (s *UserService) GetUserPurchases(userID uuid.UUID, page, limit int) ([]models.Purchase, int64, error) {
	var purchases []models.Purchase
	var total int64

	query := s.db.Model(&models.Purchase{}).Where("buyer_id = ?", userID).Preload("Agent")

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get purchases with pagination
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&purchases).Error; err != nil {
		return nil, 0, err
	}

	return purchases, total, nil
}

// GetUserReviews gets all reviews written by a user
func (s *UserService) GetUserReviews(userID uuid.UUID, page, limit int) ([]models.Review, int64, error) {
	var reviews []models.Review
	var total int64

	query := s.db.Model(&models.Review{}).Where("user_id = ?", userID).Preload("Agent")

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get reviews with pagination
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&reviews).Error; err != nil {
		return nil, 0, err
	}

	return reviews, total, nil
}

// GetUserFavorites gets all favorites of a user
func (s *UserService) GetUserFavorites(userID uuid.UUID, page, limit int) ([]models.Favorite, int64, error) {
	var favorites []models.Favorite
	var total int64

	query := s.db.Model(&models.Favorite{}).Where("user_id = ?", userID).Preload("Agent")

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get favorites with pagination
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Find(&favorites).Error; err != nil {
		return nil, 0, err
	}

	return favorites, total, nil
}

// AddFavorite adds an agent to user's favorites
func (s *UserService) AddFavorite(userID, agentID uuid.UUID) error {
	favorite := models.Favorite{
		UserID:  userID,
		AgentID: agentID,
	}
	return s.db.Create(&favorite).Error
}

// RemoveFavorite removes an agent from user's favorites
func (s *UserService) RemoveFavorite(userID, agentID uuid.UUID) error {
	return s.db.Where("user_id = ? AND agent_id = ?", userID, agentID).Delete(&models.Favorite{}).Error
}

// IsFavorite checks if an agent is in user's favorites
func (s *UserService) IsFavorite(userID, agentID uuid.UUID) (bool, error) {
	var count int64
	err := s.db.Model(&models.Favorite{}).Where("user_id = ? AND agent_id = ?", userID, agentID).Count(&count).Error
	return count > 0, err
}

// ValidateUser validates user data before creation/update
func (s *UserService) ValidateUser(user *models.User) error {
	if user.Email == "" {
		return fmt.Errorf("email is required")
	}
	if user.Username == "" {
		return fmt.Errorf("username is required")
	}
	if user.PasswordHash == "" {
		return fmt.Errorf("password hash is required")
	}

	// Check if email is already taken
	var existingUser models.User
	if err := s.db.Where("email = ? AND id != ?", user.Email, user.ID).First(&existingUser).Error; err == nil {
		return fmt.Errorf("email is already taken")
	}

	// Check if username is already taken
	if err := s.db.Where("username = ? AND id != ?", user.Username, user.ID).First(&existingUser).Error; err == nil {
		return fmt.Errorf("username is already taken")
	}

	return nil
}

// GetUserActivity gets user activity (recent actions)
func (s *UserService) GetUserActivity(userID uuid.UUID, limit int) ([]map[string]interface{}, error) {
	var activity []map[string]interface{}

	// Get recent reviews
	var reviews []models.Review
	if err := s.db.Where("user_id = ?", userID).Order("created_at DESC").Limit(limit).Preload("Agent").Find(&reviews).Error; err != nil {
		return nil, err
	}

	for _, review := range reviews {
		activity = append(activity, map[string]interface{}{
			"type":       "review",
			"agent_id":   review.AgentID,
			"agent_name": review.Agent.Name,
			"rating":     review.Rating,
			"timestamp":  review.CreatedAt,
		})
	}

	// Get recent purchases
	var purchases []models.Purchase
	if err := s.db.Where("buyer_id = ?", userID).Order("created_at DESC").Limit(limit).Preload("Agent").Find(&purchases).Error; err != nil {
		return nil, err
	}

	for _, purchase := range purchases {
		activity = append(activity, map[string]interface{}{
			"type":       "purchase",
			"agent_id":   purchase.AgentID,
			"agent_name": purchase.Agent.Name,
			"amount":     purchase.Amount,
			"timestamp":  purchase.CreatedAt,
		})
	}

	// Sort by timestamp (most recent first)
	// In a real implementation, you would use a more sophisticated sorting
	// For now, we'll just return the combined results

	return activity, nil
}
