package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

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

	// Register your endpoints
	router.POST("/submit", handlers.SubmitHandler)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Running on port %s...", port)
	router.Run(":" + port)

	// Use ListenAndServe to handle graceful shutdown
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: router,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Set up graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	// Close database connection
	db.Close()

	log.Println("Shutting down server...")
}
