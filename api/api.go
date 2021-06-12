package api

import (
	"legonian/weather/config"
	"legonian/weather/db"
	"net/http"
	"strconv"
	"time"
)

type API struct {
	db     *db.DB
	server *http.Server
}

func New(cfg *config.Config, db *db.DB) *API {
	api := &API{
		db: db,
	}
	api.server = &http.Server{
		Addr:           ":" + strconv.Itoa(cfg.API.Port),
		Handler:        api.setupHandlers(),
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	return api
}

func (api *API) Run() error {
	return api.server.ListenAndServe()
}

func (api *API) setupHandlers() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/home", api.homePage)
	mux.HandleFunc("/get", api.getWeather)
	mux.HandleFunc("/set", api.setWeather)

	mux.Handle(
		"/static/",
		http.StripPrefix(
			"/static/",
			http.FileServer(
				http.Dir(
					"./static",
				),
			),
		),
	)

	return mux
}
