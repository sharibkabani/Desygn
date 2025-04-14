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
	fmt.Println("Using Gemini API key (first 5 chars):", os.Getenv("GEMINI_API_KEY"))

	prompt := fmt.Sprintf(`
You are an expert system design interviewer.

Evaluate the following system design problem and user solution:

Problem Title: %s

Problem Description:
%s

User's Solution:
%s

Please provide a score out of 60, followed by strengths and improvement areas.

Respond in this format:
Score: X/60

Strengths:
- ...

Improvements:
- ...
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
	fmt.Println("📡 Gemini Raw Response:")
	fmt.Println(string(body))

	var result GeminiResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return "", err
	}

	if len(result.Candidates) == 0 {
		return "", fmt.Errorf("no candidates returned")
	}

	return result.Candidates[0].Content.Parts[0].Text, nil
}
