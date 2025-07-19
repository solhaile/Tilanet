-- Script to create test database
-- Run this manually in PostgreSQL if the test database doesn't exist

-- Connect to postgres database first
\c postgres;

-- Create test database if it doesn't exist
CREATE DATABASE tilanet_test;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE tilanet_test TO postgres;

-- Switch to test database
\c tilanet_test;

-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The schema will be created automatically by the test setup
