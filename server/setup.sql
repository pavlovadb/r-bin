-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist
DROP TABLE IF EXISTS request CASCADE;
DROP TABLE IF EXISTS basket CASCADE;

-- Create the basket table
CREATE TABLE basket (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_name text NOT NULL UNIQUE, 
  total_request INTEGER DEFAULT 0
);

-- Create the request table
CREATE TABLE request (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  basket_path_name text NOT NULL REFERENCES basket (path_name) ON DELETE CASCADE,
  method text NOT NULL,
  header text NOT NULL,
  time_stamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mongodb_path text
);

-- Create SQL trigger function to increment total_request
CREATE OR REPLACE FUNCTION increment_total_request()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE basket
  SET total_request = total_request + 1
  WHERE path_name = NEW.basket_path_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on the request table
CREATE TRIGGER trigger_increment_total_request
AFTER INSERT ON request
FOR EACH ROW
EXECUTE FUNCTION increment_total_request();

-- -- Create seed data for basket table
-- INSERT INTO basket (path_name, total_request) 
-- 	VALUES 
--     ('happy', DEFAULT),
--     ('burger', DEFAULT);

-- -- Create seed data for request table
-- INSERT INTO request (basket_path_name, method, header, mongodb_path) 
-- 	VALUES (
-- 	  'happy',
-- 	  'POST',
-- 	  '{ "Accept": "*/*", "Connection": "close", "Content-Length": "7635", "Content-Type": "application/json" }',
-- 	  '68b254139d875e0861ad9f6d'
-- 	);
	