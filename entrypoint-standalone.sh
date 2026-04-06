#!/bin/bash
# /** 
#  * @author Naveen Chauhan (https://github.com/ncrkindia) 
#  * @project Link-Wise Analytics - Unified Standalone Bundle
#  */
set -e

# --- MariaDB Atomic Bootstrap (Zero-Network) ---
echo "Configuring Platform Persistence (Atomic Bootstrap)..."

# Ensure data directory exists
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "First boot: Initializing MariaDB storage..."
    mariadb-install-db --user=mysql --datadir=/var/lib/mysql
fi

# Use bootstrap mode to execute SQL without starting the server
# This resolves all 'Stuck' socket/ping issues permanently
/usr/sbin/mariadbd --user=mysql --bootstrap <<EOF
-- 1. Link-Wise App Setup
CREATE DATABASE IF NOT EXISTS linkwise;
GRANT ALL PRIVILEGES ON linkwise.* TO 'linkwise_user'@'localhost' IDENTIFIED BY 'linkwise_pass';
GRANT ALL PRIVILEGES ON linkwise.* TO 'linkwise_user'@'%' IDENTIFIED BY 'linkwise_pass';

-- 2. Keycloak System Setup
CREATE DATABASE IF NOT EXISTS keycloak;
GRANT ALL PRIVILEGES ON keycloak.* TO 'keycloak_user'@'localhost' IDENTIFIED BY 'keycloak_pass';
GRANT ALL PRIVILEGES ON keycloak.* TO 'keycloak_user'@'%' IDENTIFIED BY 'keycloak_pass';

-- 3. Link-Wise Platform Schema (Atomic)
USE linkwise;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS links (
  id VARCHAR(10) PRIMARY KEY,
  original_url TEXT NOT NULL,
  user_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  password_hash VARCHAR(255) NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_pixel BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS clicks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  link_id VARCHAR(10) NOT NULL,
  clicked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  referrer TEXT NULL,
  country_code CHAR(2) NULL,
  FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_accounts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  provider VARCHAR(50) DEFAULT 'CUSTOM',
  host VARCHAR(255) NOT NULL,
  port INT NOT NULL DEFAULT 587,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_templates (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NULL,
  text_content TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_campaigns (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  template_id VARCHAR(36) NOT NULL,
  account_id VARCHAR(36) NOT NULL,
  recipients TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES email_templates(id),
  FOREIGN KEY (account_id) REFERENCES email_accounts(id)
);

CREATE TABLE IF NOT EXISTS campaign_sends (
  id INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id VARCHAR(36) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  pixel_id VARCHAR(10) NOT NULL,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (pixel_id) REFERENCES links(id)
);

-- 4. Flush and Finalize
FLUSH PRIVILEGES;
EOF

# --- Keycloak Build (Optimized) ---
echo "Optimizing identity provider for standalone deployment (MySQL dialect)..."
/opt/keycloak/bin/kc.sh build --db=mysql --health-enabled=true

# --- Hand-off to Supervisor ---
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
