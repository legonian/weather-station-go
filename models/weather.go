package models

import "time"

const WeatherTable = "weather"

type Weather struct {
	Temperature float32   `json:"temp"`
	Humidity    int32     `json:"humidity"`
	Preasure    int32     `json:"preasure"`
	Time        time.Time `json:"time"`
}
