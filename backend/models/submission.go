package models

import (
	"encoding/json"
	"time"
)

type Submission struct {
	ID           int             `json:"id"`
	UserID       string          `json:"user_id"`
	ProblemID    int             `json:"problem_id"`
	SolutionText string          `json:"solution_text"`
	DiagramData  json.RawMessage `json:"diagram_data"`       // JSON string
	Score        *int            `json:"score,omitempty"`    // Optional (nullable in DB)
	Feedback     *string         `json:"feedback,omitempty"` // Optional
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
}

type Problem struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Difficulty  string    `json:"difficulty"`
	Tags        []string  `json:"tags"`
	IsPublished bool      `json:"is_published"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type SyncUserRequest struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	Username      string `json:"username"`
	FullName      string `json:"full_name"`
	ProfilePicURL string `json:"profile_pic_url"`
}
