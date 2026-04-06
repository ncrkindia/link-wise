-- LinkWise Database Schema

-- Users table
-- Stores user information. The `id` is an email from the JWT.
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY, -- User's email from JWT
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- Links table
-- Stores information about shortened links.
CREATE TABLE links (
  id VARCHAR(10) PRIMARY KEY, -- The short code for the link
  original_url TEXT NOT NULL,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL, -- Can be NULL for anonymous links
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiration date
  password_hash VARCHAR(255), -- Optional password (hashed)
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  is_pixel BOOLEAN DEFAULT FALSE
);

-- Clicks table
-- Stores click analytics for each link.
CREATE TABLE clicks (
  id SERIAL PRIMARY KEY,
  link_id VARCHAR(10) NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer TEXT,
  country_code CHAR(2)
);

-- Sample data for testing
INSERT INTO users (id, is_admin) VALUES ('admin@linkwise.com', TRUE);
INSERT INTO users (id, is_admin) VALUES ('user@example.com', FALSE);
