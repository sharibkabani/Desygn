package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sharibkabani/desygn-backend/db"
	"github.com/sharibkabani/desygn-backend/models"
	"github.com/sharibkabani/desygn-backend/utils"
)

func SubmitHandler(c *gin.Context) {
	var submission models.Submission

	if err := c.ShouldBindJSON(&submission); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	submission.CreatedAt = now
	submission.UpdatedAt = now

	// Save or update the submission in the DB and return the new submission ID
	var submissionID int
	err := db.Conn.QueryRow(context.Background(),
		`INSERT INTO submissions (user_id, problem_id, solution_text, diagram_data, is_draft, created_at, updated_at)
         VALUES ($1, $2, $3, $4, false, $5, $5)
         ON CONFLICT (user_id, problem_id)
         DO UPDATE SET solution_text = $3, diagram_data = $4, is_draft = false, updated_at = $5
         RETURNING id`,
		submission.UserID, submission.ProblemID, submission.SolutionText, submission.DiagramData, now,
	).Scan(&submissionID)

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
		// Extract JSON from the feedback string
		feedback = strings.TrimSpace(feedback) // Remove leading/trailing whitespace
		if strings.HasPrefix(feedback, "```json") && strings.HasSuffix(feedback, "```") {
			feedback = feedback[7 : len(feedback)-3] // Remove the ```json and ``` delimiters
		}

		// Validate and parse the feedback as JSON
		var feedbackJSON map[string]interface{}
		if err := json.Unmarshal([]byte(feedback), &feedbackJSON); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid feedback JSON: " + err.Error()})
			return
		}

		// Convert feedbackJSON to a JSON string
		feedbackJSONString, err := json.Marshal(feedbackJSON)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to convert feedback to JSON string: " + err.Error()})
			return
		}

		// Update the database with the parsed JSON feedback
		_, _ = db.Conn.Exec(context.Background(),
			`UPDATE submissions SET feedback = $1 WHERE id = $2`,
			feedbackJSONString, submissionID,
		)
	}

	// Return the new submission ID in the response
	c.JSON(http.StatusOK, gin.H{"message": "Submission received", "submission_id": submissionID})
}
