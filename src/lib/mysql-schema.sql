-- LinkWise MySQL Database Schema
-- Last Updated: 2026-04-09

-- Users table
-- Stores user information. The `id` is an email from the JWT.
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY, -- User's email from JWT
    name VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

-- Links table
-- Stores information about shortened links.
CREATE TABLE IF NOT EXISTS links (
    id VARCHAR(10) PRIMARY KEY, -- The short code for the link
    original_url TEXT NOT NULL,
    user_id VARCHAR(255), -- Can be NULL for anonymous links
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL, -- Optional expiration date
    password_hash VARCHAR(255) NULL, -- Optional password (hashed)
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_pixel BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- Clicks table
-- Stores click analytics for each link.
CREATE TABLE IF NOT EXISTS clicks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    link_id VARCHAR(10) NOT NULL,
    clicked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    referrer TEXT NULL,
    country_code CHAR(2) NULL,
    FOREIGN KEY (link_id) REFERENCES links (id) ON DELETE CASCADE
);

-- Email Accounts table
-- Stores SMTP credentials for campaigns.
CREATE TABLE IF NOT EXISTS email_accounts (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    user_id VARCHAR(255) NOT NULL,
    provider VARCHAR(50) DEFAULT 'CUSTOM', -- GMAIL, OUTLOOK, YAHOO, CUSTOM
    host VARCHAR(255) NOT NULL,
    port INT NOT NULL DEFAULT 587,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Email Templates table
-- Stores HTML/Plaintext templates.
CREATE TABLE IF NOT EXISTS email_templates (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NULL,
    text_content TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Email Campaigns table
-- Stores information about specific email sends.
CREATE TABLE IF NOT EXISTS email_campaigns (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    template_id VARCHAR(36) NOT NULL,
    account_id VARCHAR(36) NOT NULL,
    recipients TEXT NOT NULL, -- Comma separated or JSON
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, SENDING, COMPLETED, FAILED
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES email_templates (id),
    FOREIGN KEY (account_id) REFERENCES email_accounts (id)
);

-- Campaign Sends table
-- Tracks individual email opens via pixel_id.
CREATE TABLE IF NOT EXISTS campaign_sends (
    id INT AUTO_INCREMENT PRIMARY KEY,
    campaign_id VARCHAR(36) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    pixel_id VARCHAR(10) NOT NULL, -- FOREIGN KEY to links(id)
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campaign_id) REFERENCES email_campaigns (id) ON DELETE CASCADE,
    FOREIGN KEY (pixel_id) REFERENCES links (id)
);

-- Sample data for testing (using ON DUPLICATE KEY UPDATE to avoid errors)
INSERT INTO
    users (id, is_admin)
VALUES ('admin@slpro.in', TRUE) ON DUPLICATE KEY
UPDATE is_admin =
VALUES (is_admin);

INSERT INTO
    users (id, is_admin)
VALUES ('test@slpro.in', FALSE) ON DUPLICATE KEY
UPDATE is_admin =
VALUES (is_admin);