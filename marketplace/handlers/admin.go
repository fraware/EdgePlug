package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"

	"github.com/edgeplug/marketplace/models"
)

// GetStats returns marketplace statistics for admin
func (h *Handler) GetStats(c *gin.Context) {
	var stats struct {
		TotalUsers     int64 `json:"total_users"`
		TotalAgents    int64 `json:"total_agents"`
		TotalPurchases int64 `json:"total_purchases"`
		TotalReviews   int64 `json:"total_reviews"`
		PublishedAgents int64 `json:"published_agents"`
		ActiveUsers    int64 `json:"active_users"`
		TotalRevenue   float64 `json:"total_revenue"`
	}

	// Get user count
	if err := h.db.Model(&models.User{}).Where("deleted_at IS NULL").Count(&stats.TotalUsers).Error; err != nil {
		log.Error().Err(err).Msg("Failed to count users")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user count"})
		return
	}

	// Get agent count
	if err := h.db.Model(&models.Agent{}).Where("deleted_at IS NULL").Count(&stats.TotalAgents).Error; err != nil {
		log.Error().Err(err).Msg("Failed to count agents")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get agent count"})
		return
	}

	// Get published agent count
	if err := h.db.Model(&models.Agent{}).Where("status = ? AND deleted_at IS NULL", models.AgentStatusPublished).Count(&stats.PublishedAgents).Error; err != nil {
		log.Error().Err(err).Msg("Failed to count published agents")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get published agent count"})
		return
	}

	// Get purchase count
	if err := h.db.Model(&models.Purchase{}).Count(&stats.TotalPurchases).Error; err != nil {
		log.Error().Err(err).Msg("Failed to count purchases")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get purchase count"})
		return
	}

	// Get review count
	if err := h.db.Model(&models.Review{}).Count(&stats.TotalReviews).Error; err != nil {
		log.Error().Err(err).Msg("Failed to count reviews")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get review count"})
		return
	}

	// Get active users (users with activity in last 30 days)
	if err := h.db.Model(&models.User{}).Where("updated_at >= NOW() - INTERVAL '30 days' AND deleted_at IS NULL").Count(&stats.ActiveUsers).Error; err != nil {
		log.Error().Err(err).Msg("Failed to count active users")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get active user count"})
		return
	}

	// Get total revenue
	if err := h.db.Model(&models.Purchase{}).Where("status = ?", models.PurchaseStatusCompleted).Select("COALESCE(SUM(amount), 0)").Scan(&stats.TotalRevenue).Error; err != nil {
		log.Error().Err(err).Msg("Failed to calculate total revenue")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get total revenue"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": stats,
	})
}

// GetUsers returns a list of users for admin
func (h *Handler) GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	status := c.Query("status")
	role := c.Query("role")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	query := h.db.Model(&models.User{}).Where("deleted_at IS NULL")

	// Apply filters
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if role != "" {
		query = query.Where("role = ?", role)
	}

	var users []models.User
	var total int64

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		log.Error().Err(err).Msg("Failed to count users")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// Get users with pagination
	if err := query.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
		log.Error().Err(err).Msg("Failed to get users")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (int(total) + limit - 1) / limit,
		},
	})
}

// UpdateUserStatus updates a user's status (admin only)
func (h *Handler) UpdateUserStatus(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var req struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate status
	status := models.UserStatus(req.Status)
	switch status {
	case models.UserStatusActive, models.UserStatusInactive, models.UserStatusBanned:
		// Valid status
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	// Check if user exists
	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		log.Error().Err(err).Msg("Database error getting user")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// Update user status
	if err := h.db.Model(&user).Update("status", status).Error; err != nil {
		log.Error().Err(err).Msg("Failed to update user status")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "User status updated successfully",
		"user": gin.H{
			"id":     user.ID,
			"email":  user.Email,
			"status": status,
		},
	})
}

// GetUserDetails returns detailed user information for admin
func (h *Handler) GetUserDetails(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var user models.User
	if err := h.db.Preload("Agents").Preload("Purchases").Preload("Reviews").First(&user, userID).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		log.Error().Err(err).Msg("Database error getting user")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// Get user statistics
	stats, err := h.userSvc.GetUserStats(userID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get user stats")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user":  user,
		"stats": stats,
	})
}

// GetAgentDetails returns detailed agent information for admin
func (h *Handler) GetAgentDetails(c *gin.Context) {
	agentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid agent ID"})
		return
	}

	var agent models.Agent
	if err := h.db.Preload("Publisher").Preload("Reviews.User").Preload("Purchases").First(&agent, agentID).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
			return
		}
		log.Error().Err(err).Msg("Database error getting agent")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// Get agent statistics
	stats, err := h.agentSvc.GetAgentStats(agentID)
	if err != nil {
		log.Error().Err(err).Msg("Failed to get agent stats")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get agent statistics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"agent": agent,
		"stats": stats,
	})
}

// ApproveAgent approves an agent for publication
func (h *Handler) ApproveAgent(c *gin.Context) {
	agentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid agent ID"})
		return
	}

	// Check if agent exists
	var agent models.Agent
	if err := h.db.First(&agent, agentID).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
			return
		}
		log.Error().Err(err).Msg("Database error getting agent")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// Update agent status to published
	if err := h.agentSvc.PublishAgent(agentID); err != nil {
		log.Error().Err(err).Msg("Failed to approve agent")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve agent"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Agent approved successfully",
		"agent_id": agentID,
	})
}

// RejectAgent rejects an agent
func (h *Handler) RejectAgent(c *gin.Context) {
	agentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid agent ID"})
		return
	}

	var req struct {
		Reason string `json:"reason"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if agent exists
	var agent models.Agent
	if err := h.db.First(&agent, agentID).Error; err != nil {
		if err.Error() == "record not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Agent not found"})
			return
		}
		log.Error().Err(err).Msg("Database error getting agent")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	// Update agent status to rejected
	if err := h.db.Model(&agent).Update("status", models.AgentStatusRejected).Error; err != nil {
		log.Error().Err(err).Msg("Failed to reject agent")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reject agent"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Agent rejected successfully",
		"agent_id": agentID,
		"reason":   req.Reason,
	})
} 