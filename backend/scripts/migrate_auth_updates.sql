-- Migration script for AUTH-01 updates
-- Run this script to add new fields to existing tables

-- Add preferred_language column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'en';

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    refresh_token text NOT NULL UNIQUE,
    device_info text,
    ip_address text,
    is_active boolean NOT NULL DEFAULT true,
    expires_at timestamp NOT NULL,
    created_at timestamp DEFAULT now() NOT NULL,
    updated_at timestamp DEFAULT now() NOT NULL,
    CONSTRAINT sessions_user_id_users_id_fk 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);

-- Add index for preferred_language if needed
CREATE INDEX IF NOT EXISTS idx_users_preferred_language ON users(preferred_language);

-- Update existing users to have a default language preference
UPDATE users 
SET preferred_language = 'en' 
WHERE preferred_language IS NULL;

-- Add comment to document the schema
COMMENT ON COLUMN users.preferred_language IS 'User preferred language: en (English) or am (Amharic)';
COMMENT ON TABLE sessions IS 'User sessions for refresh token management';
COMMENT ON COLUMN sessions.refresh_token IS 'Secure refresh token for token renewal';
COMMENT ON COLUMN sessions.device_info IS 'Device information for session tracking';
COMMENT ON COLUMN sessions.ip_address IS 'IP address for security monitoring';
COMMENT ON COLUMN sessions.is_active IS 'Whether the session is currently active';
COMMENT ON COLUMN sessions.expires_at IS 'Session expiration timestamp'; 