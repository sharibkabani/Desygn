package db

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5"
)

var Conn *pgx.Conn

func Connect() error {
	var err error
	Conn, err = pgx.Connect(context.Background(), os.Getenv("DATABASE_URL"))
	if err != nil {
		return fmt.Errorf("unable to connect to database: %w", err)
	}
	return nil
}

func Close() {
	if Conn != nil {
		Conn.Close(context.Background())
	}
	fmt.Println("Database connection closed.")
}
