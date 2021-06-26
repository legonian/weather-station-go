package main

import (
	"legonian/weather/api"
	"legonian/weather/config"
	"legonian/weather/db"
	"log"
)

func main() {
	// Uncomment to also save logs to log file
	// logFile, err := os.OpenFile("log.txt", os.O_RDWR|os.O_CREATE|os.O_APPEND, 0666)
	// if err != nil {
	// 	log.Fatalf("error opening file: %v", err)
	// }
	// defer logFile.Close()
	// log.SetOutput(io.MultiWriter(os.Stdout, logFile))

	cfg, err := config.New("config.json")
	if err != nil {
		log.Fatalf("config.New: %v", err)
	}
	log.Printf("Set Configs")
	db, err := db.New(cfg)
	if err != nil {
		log.Fatalf("db.New: %v", err)
	}
	log.Printf("Set DB")
	api := api.New(cfg, db)
	log.Printf("Set API")
	if err := api.Run(); err != nil {
		log.Fatalf("api.Run(): %v", err)
	}
}
