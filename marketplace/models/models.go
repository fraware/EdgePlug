package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a marketplace user
type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email        string    `gorm:"uniqueIndex;not null" json:"email"`
	Username     string    `gorm:"uniqueIndex;not null" json:"username"`
	PasswordHash string    `gorm:"not null" json:"-"`
	FirstName   string    `json:"first_name"`
	LastName    string    `json:"last_name"`
	Company     string    `json:"company"`
	Role        UserRole  `gorm:"type:varchar(20);default:'user'" json:"role"`
	Status      UserStatus `gorm:"type:varchar(20);default:'active'" json:"status"`
	Verified    bool      `gorm:"default:false" json:"verified"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Agents      []Agent      `gorm:"foreignKey:PublisherID" json:"agents,omitempty"`
	Purchases   []Purchase   `gorm:"foreignKey:BuyerID" json:"purchases,omitempty"`
	Reviews     []Review     `gorm:"foreignKey:UserID" json:"reviews,omitempty"`
	Favorites   []Favorite   `gorm:"foreignKey:UserID" json:"favorites,omitempty"`
}

// Agent represents an EdgePlug agent available in the marketplace
type Agent struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	Version     string    `gorm:"not null" json:"version"`
	PublisherID uuid.UUID `gorm:"type:uuid;not null" json:"publisher_id"`
	Category    string    `gorm:"not null" json:"category"`
	Tags        []string  `gorm:"type:text[]" json:"tags"`
	Price       float64   `gorm:"not null;default:0" json:"price"`
	Currency    string    `gorm:"default:'USD'" json:"currency"`
	Status      AgentStatus `gorm:"type:varchar(20);default:'draft'" json:"status"`
	
	// Technical specifications
	FlashSize   int    `json:"flash_size"`   // in bytes
	SRAMSize    int    `json:"sram_size"`    // in bytes
	MaxLatency  int    `json:"max_latency"`  // in microseconds
	SafetyLevel SafetyLevel `gorm:"type:varchar(20);default:'basic'" json:"safety_level"`
	
	// Files and metadata
	BinaryURL   string    `json:"binary_url"`
	ManifestURL string    `json:"manifest_url"`
	IconURL     string    `json:"icon_url"`
	ReadmeURL   string    `json:"readme_url"`
	
	// Statistics
	Downloads   int       `gorm:"default:0" json:"downloads"`
	Rating      float64   `gorm:"default:0" json:"rating"`
	ReviewCount int       `gorm:"default:0" json:"review_count"`
	
	// Timestamps
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	PublishedAt *time.Time `json:"published_at,omitempty"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Publisher   User       `gorm:"foreignKey:PublisherID" json:"publisher,omitempty"`
	Reviews     []Review   `gorm:"foreignKey:AgentID" json:"reviews,omitempty"`
	Purchases   []Purchase `gorm:"foreignKey:AgentID" json:"purchases,omitempty"`
	Favorites   []Favorite `gorm:"foreignKey:AgentID" json:"favorites,omitempty"`
}

// Purchase represents a user's purchase of an agent
type Purchase struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	BuyerID   uuid.UUID `gorm:"type:uuid;not null" json:"buyer_id"`
	AgentID   uuid.UUID `gorm:"type:uuid;not null" json:"agent_id"`
	Amount    float64   `gorm:"not null" json:"amount"`
	Currency  string    `gorm:"not null" json:"currency"`
	Status    PurchaseStatus `gorm:"type:varchar(20);default:'pending'" json:"status"`
	PaymentID string    `json:"payment_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	Buyer User  `gorm:"foreignKey:BuyerID" json:"buyer,omitempty"`
	Agent Agent `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
}

// Review represents a user's review of an agent
type Review struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	AgentID   uuid.UUID `gorm:"type:uuid;not null" json:"agent_id"`
	Rating    int       `gorm:"not null;check:rating >= 1 AND rating <= 5" json:"rating"`
	Comment   string    `gorm:"type:text" json:"comment"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	User  User  `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Agent Agent `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
}

// Favorite represents a user's favorite agent
type Favorite struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	AgentID   uuid.UUID `gorm:"type:uuid;not null" json:"agent_id"`
	CreatedAt time.Time `json:"created_at"`

	// Relationships
	User  User  `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Agent Agent `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
}

// Transaction represents a financial transaction
type Transaction struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	PurchaseID  uuid.UUID `gorm:"type:uuid;not null" json:"purchase_id"`
	Amount      float64   `gorm:"not null" json:"amount"`
	Currency    string    `gorm:"not null" json:"currency"`
	Type        TransactionType `gorm:"type:varchar(20);not null" json:"type"`
	Status      TransactionStatus `gorm:"type:varchar(20);default:'pending'" json:"status"`
	PaymentMethod string  `gorm:"type:varchar(50)" json:"payment_method"`
	ExternalID  string    `json:"external_id"`
	Metadata    string    `gorm:"type:jsonb" json:"metadata"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relationships
	Purchase Purchase `gorm:"foreignKey:PurchaseID" json:"purchase,omitempty"`
}

// Enums
type UserRole string
const (
	UserRoleUser    UserRole = "user"
	UserRolePublisher UserRole = "publisher"
	UserRoleAdmin   UserRole = "admin"
)

type UserStatus string
const (
	UserStatusActive   UserStatus = "active"
	UserStatusInactive UserStatus = "inactive"
	UserStatusBanned   UserStatus = "banned"
)

type AgentStatus string
const (
	AgentStatusDraft     AgentStatus = "draft"
	AgentStatusPending   AgentStatus = "pending"
	AgentStatusPublished AgentStatus = "published"
	AgentStatusRejected  AgentStatus = "rejected"
	AgentStatusArchived  AgentStatus = "archived"
)

type SafetyLevel string
const (
	SafetyLevelBasic    SafetyLevel = "basic"
	SafetyLevelStandard SafetyLevel = "standard"
	SafetyLevelAdvanced SafetyLevel = "advanced"
	SafetyLevelCritical SafetyLevel = "critical"
)

type PurchaseStatus string
const (
	PurchaseStatusPending   PurchaseStatus = "pending"
	PurchaseStatusCompleted PurchaseStatus = "completed"
	PurchaseStatusFailed    PurchaseStatus = "failed"
	PurchaseStatusRefunded  PurchaseStatus = "refunded"
)

type TransactionType string
const (
	TransactionTypePurchase TransactionType = "purchase"
	TransactionTypeRefund  TransactionType = "refund"
	TransactionTypeFee     TransactionType = "fee"
)

type TransactionStatus string
const (
	TransactionStatusPending   TransactionStatus = "pending"
	TransactionStatusCompleted TransactionStatus = "completed"
	TransactionStatusFailed    TransactionStatus = "failed"
	TransactionStatusCancelled TransactionStatus = "cancelled"
)

// BeforeCreate hooks
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

func (a *Agent) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

func (p *Purchase) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

func (r *Review) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}

func (f *Favorite) BeforeCreate(tx *gorm.DB) error {
	if f.ID == uuid.Nil {
		f.ID = uuid.New()
	}
	return nil
}

func (t *Transaction) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
} 