package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

const geminiURL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent"

type ContentRequest struct {
	Contents []Content `json:"contents"`
}

type Content struct {
	Parts []Part `json:"parts"`
}

type Part struct {
	Text string `json:"text"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
}

func JudgeSubmission(problemTitle, problemDesc, solutionText string) (string, error) {
	prompt := fmt.Sprintf(`
	You are an experienced system design interviewer evaluating a candidate's solution.
	
	Evaluate the following system design solution based on architectural principles, scalability thinking, and overall approach.
	
	Problem Title: %s
	
	Problem Description:
	%s
	
	User's Solution:
	%s
	
	Provide a balanced evaluation in JSON format with the following structure:
	{
	  "score": <integer between 0-100>,
	  "strengths": ["strength1", "strength2", "strength3"...],
	  "improvements": ["improvement1", "improvement2", "improvement3"...]
	}
	
	Guidelines for your evaluation:
	- Focus primarily on architectural choices, system thinking, and problem-solving approach
	- Consider trade-offs and assumptions made by the candidate
	- Evaluate understanding of core distributed systems principles
	- Include some feedback on technology choices, but don't overemphasize specific technology selection
	- Be encouraging and educational rather than overly critical
	- Provide 3-5 specific strengths and 2-4 areas for improvement
	- Score 70+ for solutions showing solid understanding with some gaps
	- Score 80+ for comprehensive solutions with good justification
	- Score 90+ for exceptional solutions with deep insight
	
	Return only valid JSON without explanation or additional text.
	`, problemTitle, problemDesc, solutionText)

	reqBody := ContentRequest{
		Contents: []Content{
			{Parts: []Part{{Text: prompt}}},
		},
	}

	jsonBody, _ := json.Marshal(reqBody)
	resp, err := http.Post(
		fmt.Sprintf("%s?key=%s", geminiURL, os.Getenv("GEMINI_API_KEY")),
		"application/json",
		bytes.NewBuffer(jsonBody),
	)

	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var result GeminiResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return "", err
	}

	if len(result.Candidates) == 0 {
		return "", fmt.Errorf("no candidates returned")
	}

	return result.Candidates[0].Content.Parts[0].Text, nil
}
