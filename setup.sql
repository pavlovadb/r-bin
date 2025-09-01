CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
DROP TABLE IF EXISTS request CASCADE;
DROP TABLE IF EXISTS basket CASCADE;

CREATE TABLE basket (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_name text NOT NULL UNIQUE, 
  total_request INTEGER DEFAULT 0
);

CREATE TABLE request (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  basket_path_name text NOT NULL REFERENCES basket (path_name) ON DELETE CASCADE,
  method text NOT NULL,
  header text NOT NULL,
  time_stamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mongodb_path text
);

INSERT INTO basket (path_name, total_request) 
	VALUES 
    ('happy', 5),
    ('burger', DEFAULT);

INSERT INTO request (basket_path_name, method, header, mongodb_path) 
	VALUES (
	  'happy',
	  'POST',
	  '{ "Accept": "*/*", "Connection": "close", "Content-Length": "7635", "Content-Type": "application/json" }',
	  '68b254139d875e0861ad9f6d'
	);
	