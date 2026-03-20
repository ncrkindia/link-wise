-- LinkWise MySQL Database Schema

-- Users table
-- Stores user information. The `id` is an email from the JWT.
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY, -- User's email from JWT
  name VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  name	varchar(255) 
);

-- Links table
-- Stores information about shortened links.
CREATE TABLE links (
  id VARCHAR(10) PRIMARY KEY, -- The short code for the link
  original_url TEXT NOT NULL,
  user_id VARCHAR(255), -- Can be NULL for anonymous links
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL, -- Optional expiration date
  password_hash VARCHAR(255) NULL, -- Optional password (hashed)
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Clicks table
-- Stores click analytics for each link.
CREATE TABLE clicks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  link_id VARCHAR(10) NOT NULL,
  clicked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  referrer TEXT NULL,
  country_code CHAR(2) NULL,
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
);

-- Sample data for testing
INSERT INTO users (id, is_admin) VALUES ('admin@linkwise.com', TRUE);
INSERT INTO users (id, is_admin) VALUES ('user@example.com', FALSE);
