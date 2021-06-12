--create table with URLs
DROP TABLE IF EXISTS weather;
CREATE TABLE IF NOT EXISTS weather (
  weather_id    int primary key generated always as identity,
  temperature   decimal   not null,
  humidity      int       not null,
  preasure      int       not null,
  created_at    timestamp not null default current_timestamp
);