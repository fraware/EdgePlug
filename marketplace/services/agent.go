package services

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/edgeplug/marketplace/models"
)

// AgentService handles agent-related business logic
type AgentService struct {
	db *gorm.DB
}

// NewAgentService creates a new agent service
func NewAgentService(db *gorm.DB) *AgentService {
	return &AgentService{db: db}
}

// CreateAgent creates a new agent
func (s *AgentService) CreateAgent(agent *models.Agent) error {
	return s.db.Create(agent).Error
}

// GetAgentByID retrieves an agent by ID
func (s *AgentService) GetAgentByID(id uuid.UUID) (*models.Agent, error) {
	var agent models.Agent
	if err := s.db.Preload("Publisher").Preload("Reviews.User").First(&agent, id).Error; err != nil {
		return nil, err
	}
	return &agent, nil
}

// GetAgents retrieves agents with filtering and pagination
func (s *AgentService) GetAgents(page, limit int, filters map[string]interface{}) ([]models.Agent, int64, error) {
	var agents []models.Agent
	var total int64

	query := s.db.Model(&models.Agent{}).Where("deleted_at IS NULL")

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

	// Get agents with pagination
	offset := (page - 1) * limit
	if err := query.Offset(offset).Limit(limit).Preload("Publisher").Find(&agents).Error; err != nil {
		return nil, 0, err
	}

	return agents, total, nil
}

// UpdateAgent updates an agent
func (s *AgentService) UpdateAgent(id uuid.UUID, updates map[string]interface{}) error {
	return s.db.Model(&models.Agent{}).Where("id = ?", id).Updates(updates).Error
}

// DeleteAgent deletes an agent
func (s *AgentService) DeleteAgent(id uuid.UUID) error {
	return s.db.Delete(&models.Agent{}, id).Error
}

// PublishAgent publishes an agent
func (s *AgentService) PublishAgent(id uuid.UUID) error {
	now := time.Now()
	updates := map[string]interface{}{
		"status":       models.AgentStatusPublished,
		"published_at": &now,
	}
	return s.UpdateAgent(id, updates)
}

// UnpublishAgent unpublishes an agent
func (s *AgentService) UnpublishAgent(id uuid.UUID) error {
	updates := map[string]interface{}{
		"status":       models.AgentStatusDraft,
		"published_at": nil,
	}
	return s.UpdateAgent(id, updates)
}

// IncrementDownloads increments the download count for an agent
func (s *AgentService) IncrementDownloads(id uuid.UUID) error {
	return s.db.Model(&models.Agent{}).Where("id = ?", id).UpdateColumn("downloads", gorm.Expr("downloads + ?", 1)).Error
}

// GetAgentStats returns statistics for an agent
func (s *AgentService) GetAgentStats(id uuid.UUID) (map[string]interface{}, error) {
	var agent models.Agent
	if err := s.db.First(&agent, id).Error; err != nil {
		return nil, err
	}

	var reviewCount int64
	var avgRating float64

	// Get review statistics
	if err := s.db.Model(&models.Review{}).Where("agent_id = ?", id).Count(&reviewCount).Error; err != nil {
		return nil, err
	}

	if reviewCount > 0 {
		if err := s.db.Model(&models.Review{}).Where("agent_id = ?", id).Select("AVG(rating)").Scan(&avgRating).Error; err != nil {
			return nil, err
		}
	}

	stats := map[string]interface{}{
		"downloads":     agent.Downloads,
		"rating":        agent.Rating,
		"review_count":  agent.ReviewCount,
		"avg_rating":    avgRating,
		"total_reviews": reviewCount,
	}

	return stats, nil
}

// SearchAgents searches agents by text
func (s *AgentService) SearchAgents(query string, page, limit int) ([]models.Agent, int64, error) {
	var agents []models.Agent
	var total int64

	dbQuery := s.db.Model(&models.Agent{}).Where("deleted_at IS NULL")

	if query != "" {
		dbQuery = dbQuery.Where("name ILIKE ? OR description ILIKE ?", "%"+query+"%", "%"+query+"%")
	}

	// Get total count
	if err := dbQuery.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get agents with pagination
	offset := (page - 1) * limit
	if err := dbQuery.Offset(offset).Limit(limit).Preload("Publisher").Find(&agents).Error; err != nil {
		return nil, 0, err
	}

	return agents, total, nil
}

// GetAgentsByCategory gets agents by category
func (s *AgentService) GetAgentsByCategory(category string, page, limit int) ([]models.Agent, int64, error) {
	filters := map[string]interface{}{
		"category": category,
		"status":   models.AgentStatusPublished,
	}
	return s.GetAgents(page, limit, filters)
}

// GetAgentsByPublisher gets agents by publisher
func (s *AgentService) GetAgentsByPublisher(publisherID uuid.UUID, page, limit int) ([]models.Agent, int64, error) {
	filters := map[string]interface{}{
		"publisher_id": publisherID,
	}
	return s.GetAgents(page, limit, filters)
}

// GetFeaturedAgents gets featured agents (high rating, many downloads)
func (s *AgentService) GetFeaturedAgents(limit int) ([]models.Agent, error) {
	var agents []models.Agent

	query := s.db.Model(&models.Agent{}).
		Where("deleted_at IS NULL").
		Where("status = ?", models.AgentStatusPublished).
		Where("rating >= ?", 4.0).
		Where("downloads >= ?", 10).
		Order("rating DESC, downloads DESC").
		Limit(limit).
		Preload("Publisher")

	return agents, query.Find(&agents).Error
}

// GetRecentAgents gets recently published agents
func (s *AgentService) GetRecentAgents(limit int) ([]models.Agent, error) {
	var agents []models.Agent

	query := s.db.Model(&models.Agent{}).
		Where("deleted_at IS NULL").
		Where("status = ?", models.AgentStatusPublished).
		Order("published_at DESC").
		Limit(limit).
		Preload("Publisher")

	return agents, query.Find(&agents).Error
}

// ValidateAgent validates agent data before creation/update
func (s *AgentService) ValidateAgent(agent *models.Agent) error {
	if agent.Name == "" {
		return fmt.Errorf("agent name is required")
	}
	if agent.Version == "" {
		return fmt.Errorf("agent version is required")
	}
	if agent.Category == "" {
		return fmt.Errorf("agent category is required")
	}
	if agent.Price < 0 {
		return fmt.Errorf("agent price cannot be negative")
	}
	if agent.FlashSize < 0 {
		return fmt.Errorf("flash size cannot be negative")
	}
	if agent.SRAMSize < 0 {
		return fmt.Errorf("SRAM size cannot be negative")
	}
	if agent.MaxLatency < 0 {
		return fmt.Errorf("max latency cannot be negative")
	}

	return nil
}
