package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sharibkabani/desygn-backend/db"
	"github.com/sharibkabani/desygn-backend/models"
	"github.com/sharibkabani/desygn-backend/utils"
)

func parseScoreFromFeedback(text string) int {
	var score int
	fmt.Sscanf(text, "Score: %d", &score)
	return score
}

func SubmitHandler(c *gin.Context) {
	var submission models.Submission

	if err := c.ShouldBindJSON(&submission); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	submission.CreatedAt = now
	submission.UpdatedAt = now

	// Save or update the submission in the DB
	_, err := db.Conn.Exec(context.Background(),
		`INSERT INTO submissions (user_id, problem_id, solution_text, diagram_data, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $5)
         ON CONFLICT (user_id, problem_id)
         DO UPDATE SET solution_text = $3, diagram_data = $4, updated_at = $5`,
		submission.UserID, submission.ProblemID, submission.SolutionText, submission.DiagramData, now,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB insert error: " + err.Error()})
		return
	}

	// Fetch problem data
	var title, desc string
	row := db.Conn.QueryRow(context.Background(),
		`SELECT title, description FROM problems WHERE id=$1`, submission.ProblemID)
	_ = row.Scan(&title, &desc)

	// Judge using Gemini
	feedback, err := utils.JudgeSubmission(title, desc, submission.SolutionText)
	if err == nil {
		score := parseScoreFromFeedback(feedback)

		_, _ = db.Conn.Exec(context.Background(),
			`UPDATE submissions SET score = $1, feedback = $2 WHERE user_id = $3 AND problem_id = $4`,
			score, feedback, submission.UserID, submission.ProblemID,
		)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Submission received"})
}

func GetUserSubmissions(c *gin.Context) {
	userID := c.Param("userId")

	rows, err := db.Conn.Query(context.Background(),
		`SELECT id, user_id, problem_id, solution_text, diagram_data, score, feedback, created_at, updated_at
		 FROM submissions
		 WHERE user_id = $1
		 ORDER BY created_at DESC`, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB query error: " + err.Error()})
		return
	}
	defer rows.Close()

	var submissions []models.Submission

	for rows.Next() {
		var s models.Submission
		err := rows.Scan(&s.ID, &s.UserID, &s.ProblemID, &s.SolutionText, &s.DiagramData, &s.Score, &s.Feedback, &s.CreatedAt, &s.UpdatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Row scan error: " + err.Error()})
			return
		}
		submissions = append(submissions, s)
	}

	c.JSON(http.StatusOK, submissions)
}

func SyncUserHandler(c *gin.Context) {
	var req models.SyncUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request: " + err.Error()})
		return
	}

	_, err := db.Conn.Exec(context.Background(), `
	INSERT INTO users (id, email, username, full_name, profile_pic_url)
	VALUES ($1, $2, $3, $4, $5)
	ON CONFLICT (id) DO UPDATE SET
		email = EXCLUDED.email,
		updated_at = now()
	WHERE users.username IS NULL -- only update metadata if not previously set
	`, req.ID, req.Email, req.Username, req.FullName, req.ProfilePicURL)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User synced"})
}

func GetAllProblemsHandler(c *gin.Context) {
	rows, err := db.Conn.Query(context.Background(), `
		SELECT id, title, description, difficulty, tags, is_published, created_at, updated_at
		FROM problems
		WHERE is_published = true
		ORDER BY created_at DESC
	`)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB query error: " + err.Error()})
		return
	}
	defer rows.Close()

	var problems []models.Problem

	for rows.Next() {
		var p models.Problem
		err := rows.Scan(&p.ID, &p.Title, &p.Description, &p.Difficulty, &p.Tags, &p.IsPublished, &p.CreatedAt, &p.UpdatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Row scan error: " + err.Error()})
			return
		}
		problems = append(problems, p)
	}

	c.JSON(http.StatusOK, problems)
}

func GetProblemByIDHandler(c *gin.Context) {
	id := c.Param("id")

	var p models.Problem
	err := db.Conn.QueryRow(context.Background(), `
		SELECT id, title, description, difficulty, tags, is_published, created_at, updated_at
		FROM problems
		WHERE id = $1 AND is_published = true
	`, id).Scan(&p.ID, &p.Title, &p.Description, &p.Difficulty, &p.Tags, &p.IsPublished, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Problem not found"})
		return
	}

	c.JSON(http.StatusOK, p)
}
