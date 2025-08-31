DROP TABLE IF EXISTS request CASCADE;
DROP TABLE IF EXISTS basket CASCADE;

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

INSERT INTO basket (path, total_request) 
	VALUES 
    ('happy', 5),
    ('burger', DEFAULT);

INSERT INTO request (basket_endpoint_id, method, header, mongodb_path) 
	VALUES (
	  1,
	  'POST',
	  '{ "Accept": "*/*", "Connection": "close", "Content-Length": "7635", "Content-Type": "application/json" }',
	  '68b254139d875e0861ad9f6d'
	);
	