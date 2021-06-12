package db

import (
	"database/sql"
	"fmt"
	"legonian/weather/config"
	"legonian/weather/models"
	"time"

	_ "github.com/lib/pq"
)

type (
	DB struct {
		sql *sql.DB
	}
	Filter struct {
		After time.Time
		Until time.Time
	}
)

func New(cfg *config.Config) (*DB, error) {
	psqlInfo := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		cfg.Postgres.Host,
		5432,
		cfg.Postgres.User,
		cfg.Postgres.Password,
		cfg.Postgres.Database,
		cfg.Postgres.SSLMode,
	)
	// url := "postgres:mysecretpassword@192.168.0.104:5432/postgres"
	db, err := sql.Open("postgres", psqlInfo)
	if err != nil {
		return nil, fmt.Errorf("sql.Open postgres (%s): %v", psqlInfo, err)
	}
	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("db.Ping(): %v", err)
	}
	return &DB{
		sql: db,
	}, nil
}

func (db *DB) Add(w models.Weather) error {
	sqlString := "INSERT INTO %s(temperature, humidity, preasure, created_at) VALUES($1, $2, $3, $4)"
	sqlString = fmt.Sprintf(sqlString, models.WeatherTable)

	stmt, err := db.sql.Prepare(sqlString)
	if err != nil {
		return fmt.Errorf("db.sql.Prepare: %v", err)
	}
	defer stmt.Close()
	_, err = stmt.Exec(
		w.Temperature,
		w.Humidity,
		w.Preasure,
		w.Time,
	)
	if err != nil {
		return fmt.Errorf("stmt.Exec: %v", err)
	}
	return nil
}

func (db *DB) Get(filter Filter) (weatherData []models.Weather, err error) {
	sqlString := "SELECT temperature, humidity, preasure, created_at FROM %s"
	sqlString = fmt.Sprintf(sqlString, models.WeatherTable)

	var rows *sql.Rows
	if !filter.After.IsZero() && !filter.Until.IsZero() {
		sqlString += " WHERE created_at BETWEEN $1 AND $2"
		rows, err = db.sql.Query(sqlString, filter.After, filter.Until)
	} else if !filter.After.IsZero() {
		sqlString += " WHERE created_at > $1"
		rows, err = db.sql.Query(sqlString, filter.After)
	} else if !filter.Until.IsZero() {
		sqlString += " WHERE created_at < $1"
		rows, err = db.sql.Query(sqlString, filter.Until)
	} else {
		rows, err = db.sql.Query(sqlString)
	}
	if err != nil {
		return weatherData, fmt.Errorf("db.sql.Query(%s): %v", sqlString, err)
	}
	defer rows.Close()

	var w models.Weather
	for rows.Next() {
		err := rows.Scan(
			&w.Temperature,
			&w.Humidity,
			&w.Preasure,
			&w.Time,
		)
		if err != nil {
			return weatherData, fmt.Errorf("rows.Scan: %v", err)
		}
		weatherData = append(weatherData, w)
	}
	err = rows.Err()
	if err != nil {
		return weatherData, fmt.Errorf("rows.Err: %v", err)
	}
	return weatherData, nil
}

func (db *DB) Stop() error {
	return db.sql.Close()
}
