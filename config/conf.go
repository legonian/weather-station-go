package config

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

type (
	Config struct {
		API      API
		Postgres Postgres
	}
	API struct {
		Port int
	}
	Postgres struct {
		Host     string
		Port     int
		User     string
		Password string
		Database string
		SSLMode  string
	}
)

func New(filepath string) (*Config, error) {
	jsonFile, err := os.Open(filepath)
	if err != nil {
		return nil, fmt.Errorf("os.Open %v: %v", filepath, err)
	}
	defer jsonFile.Close()

	byteValue, err := ioutil.ReadAll(jsonFile)
	if err != nil {
		return nil, fmt.Errorf("ioutil.ReadAll: %v", err)
	}

	var cfg Config
	if err := json.Unmarshal(byteValue, &cfg); err != nil {
		return nil, fmt.Errorf("json.Unmarshal: %v", err)
	}
	return &cfg, nil
}
