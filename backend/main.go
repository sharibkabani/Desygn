package main

import (
	"context"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/gin-contrib/cors"
	"github.com/sharibkabani/desygn-backend/db"
	"github.com/sharibkabani/desygn-backend/handlers"
)

func main() {
	// Load .env variables (e.g., database URL, Gemini API key)
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found (that's okay if you're using env vars directly)")
	}

	// Connect to Supabase DB
	if err := db.Connect(); err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}

	// Set up Gin router
	router := gin.Default()
	router.Use(cors.Default())

	// test endpoint
	router.GET("/test", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "working"})
	})

	// Register your endpoints
	router.POST("/submit", handlers.SubmitHandler)

	// Add a route to test DB connection
	router.GET("/dbtest", func(c *gin.Context) {
		err := db.Conn.Ping(context.Background())
		if err != nil {
			c.JSON(500, gin.H{"status": "failed", "error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"status": "success", "message": "DB connected!"})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Running on port %s...", port)
	router.Run(":" + port)
}
