#!/bin/bash
# /** 
#  * @author Naveen Chauhan (https://github.com/ncrkindia) 
#  * @project Link-Wise Analytics - Unified Standalone Bundle
#  */
set -e

# --- MariaDB Atomic Bootstrap (Zero-Network) ---
echo "Configuring Platform Persistence (Atomic Bootstrap)..."

# 1. Initialize data directory if first boot
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "First boot: Initializing MariaDB storage..."
    mariadb-install-db --user=mysql --datadir=/var/lib/mysql
fi

# 2. Start MariaDB in background (Local socket only, no networking)
echo "Starting ephemeral MariaDB for provisioning..."
mkdir -p /var/run/mysqld && chown mysql:mysql /var/run/mysqld
/usr/bin/mariadbd-safe --user=mysql --skip-networking --socket=/var/run/mysqld/mysqld.sock &
DB_PID=$!

# 3. Wait for database to reach readiness
echo "Waiting for MariaDB lifecycle readiness..."
for i in {30..0}; do
    if mariadb-admin --socket=/var/run/mysqld/mysqld.sock ping --silent; then
        break
    fi
    sleep 1
done

if [ "$i" = 0 ]; then
    echo "Error: MariaDB failed to reach readiness state."
    exit 1
fi

# 4. Provision Databases, Users, and Schema
echo "Applying Platform Schema & Privileges..."
mariadb --socket=/var/run/mysqld/mysqld.sock <<EOF
-- 1. Link-Wise App Setup
CREATE DATABASE IF NOT EXISTS linkwise;
CREATE USER IF NOT EXISTS 'linkwise_user'@'localhost' IDENTIFIED BY 'linkwise_pass';
CREATE USER IF NOT EXISTS 'linkwise_user'@'%' IDENTIFIED BY 'linkwise_pass';
GRANT ALL PRIVILEGES ON linkwise.* TO 'linkwise_user'@'localhost';
GRANT ALL PRIVILEGES ON linkwise.* TO 'linkwise_user'@'%';

-- 2. Keycloak System Setup
CREATE DATABASE IF NOT EXISTS keycloak;
CREATE USER IF NOT EXISTS 'keycloak_user'@'localhost' IDENTIFIED BY 'keycloak_pass';
CREATE USER IF NOT EXISTS 'keycloak_user'@'%' IDENTIFIED BY 'keycloak_pass';
GRANT ALL PRIVILEGES ON keycloak.* TO 'keycloak_user'@'localhost';
GRANT ALL PRIVILEGES ON keycloak.* TO 'keycloak_user'@'%';

-- 3. Flush and Finalize
FLUSH PRIVILEGES;
EOF

# 5. Shut down ephemeral instance
echo "Shutting down ephemeral MariaDB..."
mariadb-admin --socket=/var/run/mysqld/mysqld.sock shutdown
wait $DB_PID

# --- Keycloak Build (Optimized) ---
echo "Optimizing identity provider for standalone deployment (MariaDB dialect)..."
/opt/keycloak/bin/kc.sh build --db=mariadb --health-enabled=true

# --- Dynamic Configuration (Client Redirects) ---
echo "Injecting runtime environment into identity configuration..."
export REALM_IMPORT_FILE="/opt/keycloak/data/import/realm-export.json"
if [ -f "$REALM_IMPORT_FILE" ]; then
    node -e "
const fs = require('fs');
const realmPath = process.env.REALM_IMPORT_FILE;
const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010').replace(/\/$/, '');
try {
    const realm = JSON.parse(fs.readFileSync(realmPath, 'utf8'));
    realm.clients.forEach(client => {
        if (client.clientId === 'linkwise-client') {
            client.redirectUris = [appUrl + '/*', 'http://localhost:3010/*'];
            console.log('Updated redirectUris for linkwise-client:', client.redirectUris);
        }
    });
    fs.writeFileSync(realmPath, JSON.stringify(realm, null, 2));
} catch (e) {
    console.error('Failed to update realm-export.json:', e.message);
    process.exit(0); // Non-critical error
}
    "
fi

# --- Hand-off to Supervisor ---
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
