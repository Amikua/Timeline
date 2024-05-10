package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

const (
	eventsPerRequest   = 10
	unauthorized       = `{"error":"Unauthorized"}`
	errorCreatingEvent = `{"error":"Error creating event", "events":[], "hasMore":false}`
)

type User struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatarUrl"`
	GithubID  int    `json:"githubId"`
}

type ProjectEvent struct {
	ID         string    `json:"id"`
	CreatedAt  time.Time `json:"createdAt"`
	ProjectID  string    `json:"projectId"`
	HappenedAt time.Time `json:"happenedAt"`
	Content    string    `json:"content"`
	Category   string    `json:"category"`
	AuthorID   string    `json:"authorId"`
	Author     User      `json:"author"`
}

var (
	db           *sql.DB
	prepareOnce  sync.Once
	stmt         *sql.Stmt
	prepareError error
)

func initDB() {
	var err error
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set in the environment variables")
	}

	db, err = sql.Open("postgres", dsn)
	fmt.Println("Connected to database")
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}
}

func prepareStmt() {
	if db == nil {
		prepareError = fmt.Errorf("database connection is not initialized")
		return
	}
	stmt, prepareError = db.Prepare(`SELECT "ProjectEvent"."id", "ProjectEvent"."createdAt", "ProjectEvent"."projectId", "ProjectEvent"."happendAt", "ProjectEvent"."content", "ProjectEvent"."category", "ProjectEvent"."authorId",
    "User"."username", "User"."email", "User"."avatarUrl", "User"."githubId"
    FROM "ProjectEvent"
    INNER JOIN "User" ON "ProjectEvent"."authorId" = "User"."id"
    WHERE "projectId" = $1 AND "happendAt" < $2 
    ORDER BY "happendAt" DESC 
    LIMIT $3`)
}

func getProjectEvents(projectId string, happenedAt string, eventsPerRequest int) ([]ProjectEvent, error) {
	prepareOnce.Do(prepareStmt)
	if prepareError != nil {
		return nil, prepareError
	}

	rows, err := stmt.Query(projectId, happenedAt, eventsPerRequest)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []ProjectEvent
	for rows.Next() {
		var event ProjectEvent
		var author User
		if err := rows.Scan(&event.ID, &event.CreatedAt, &event.ProjectID, &event.HappenedAt, &event.Content, &event.Category, &event.AuthorID, &author.Username, &author.Email, &author.AvatarURL, &author.GithubID); err != nil {
			return nil, err
		}
		event.Author = author
		events = append(events, event)
	}
	return events, nil
}

func getProjectEventsCursor(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	// projectId := "96047d0b-469e-483b-a1f2-6b231cf153dc"
	projectId := "1706510a-b631-41f6-a623-6dbc2e2af9c4"
	happenedAt := time.Now().Format(time.RFC3339)
	// var allEvents []ProjectEvent

	// for i := 0; i < 100; i++ {
	//     events, err := getProjectEvents(projectId, happenedAt, eventsPerRequest)
	//     if err != nil {
	//         log.Println("Error getting events:", err)
	//         http.Error(w, errorCreatingEvent, http.StatusInternalServerError)
	//         return
	//     }
	//     if len(events) > 0 {
	//         happenedAt = events[len(events)-1].HappenedAt.Format(time.RFC3339)
	//         allEvents = append(allEvents, events...)
	//     }
	// }

	allEvents, err := getProjectEvents(projectId, happenedAt, eventsPerRequest)
	if err != nil {
		log.Println("Error getting events:", err)
		http.Error(w, errorCreatingEvent, http.StatusInternalServerError)
		return
	}

	response, err := json.Marshal(map[string]interface{}{
		"events":  allEvents,
		"hasMore": len(allEvents) == eventsPerRequest,
	})
	if err != nil {
		log.Println("Error marshalling response:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(response)
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}
	initDB()
	defer db.Close()

	http.HandleFunc("/api/perf", getProjectEventsCursor)
	log.Fatal(http.ListenAndServe(":3000", nil))
}
