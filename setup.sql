-- psql -U $USERNAME -f setup.sql
CREATE DATABASE requestbin;
\c requestbin

CREATE TABLE basket (
  id SERIAL PRIMARY KEY,
  path text NOT NULL, 
  total_request INTEGER DEFAULT 0
);

CREATE TABLE request (
  id SERIAL PRIMARY KEY,
  basket_endpoint_id integer NOT NULL REFERENCES basket (id) ON DELETE CASCADE,
  method text NOT NULL,
  header text NOT NULL,
  time_stamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mongodb_path text
);