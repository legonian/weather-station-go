package api

import (
	"encoding/json"
	"fmt"
	"legonian/weather/db"
	"legonian/weather/models"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"time"
)

// http://localhost:8080/home
func (api *API) homePage(w http.ResponseWriter, req *http.Request) {
	log.Printf("home page request")
	fmt.Fprint(w, "Home Page\n")
}

// http://localhost:8080/get?by=days
func (api *API) getWeather(w http.ResponseWriter, req *http.Request) {
	after, until := parseDuration(req.URL.Query())
	data, err := api.db.Get(db.Filter{
		After: after,
		Until: until,
	})
	if err != nil {
		log.Printf("api.db.Get: %v", err)
		fmt.Fprint(w, "Cant get info")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

// http://localhost:8080/set?t=30&h=40&p=100
func (api *API) setWeather(w http.ResponseWriter, req *http.Request) {
	var weather models.Weather
	query := req.URL.Query()
	if query.Get("t") != "" {
		temp, err := strconv.ParseFloat(query.Get("t"), 32)
		if err != nil {
			fmt.Fprintf(w, "Cant convert this temperature: %v", query.Get("t"))
			return
		}
		weather.Temperature = float32(temp)
	}
	if query.Get("h") != "" {
		h, err := strconv.ParseFloat(query.Get("h"), 32)
		if err != nil {
			fmt.Fprintf(w, "Cant convert this humidity: %v", query.Get("h"))
			return
		}
		weather.Humidity = int32(h)
	}
	if query.Get("p") != "" {
		h, err := strconv.ParseFloat(query.Get("p"), 32)
		if err != nil {
			fmt.Fprintf(w, "Cant convert this preasure: %v", query.Get("p"))
			return
		}
		weather.Preasure = int32(h)
	}
	weather.Time = time.Now()

	if err := api.db.Add(weather); err != nil {
		log.Printf("api.db.Add: %v", err)
		fmt.Fprint(w, "Cant set parameters")
		return
	}
	log.Printf("weather is set: %v", weather)
	fmt.Fprint(w, time.Now().Add(3*time.Hour).String())
}

func parseDuration(query url.Values) (after, until time.Time) {
	switch query.Get("last") {
	case "":
		until = time.Now()
	case "day":
		after = time.Now().AddDate(0, 0, -1)
		until = time.Now()
	case "3hours":
		after = time.Now().Add(-3 * time.Hour)
		until = time.Now()
	case "3days":
		after = time.Now().AddDate(0, 0, -3)
		until = time.Now()
	case "week":
		after = time.Now().AddDate(0, 0, -7)
		until = time.Now()
	case "month":
		after = time.Now().AddDate(0, -1, 0)
		until = time.Now()
	default:
		until = time.Now()
	}
	after = after.UTC()
	until = until.UTC()
	return
}
