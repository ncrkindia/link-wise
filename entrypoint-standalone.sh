#!/bin/bash
# /** 
#  * @author Naveen Chauhan (https://github.com/ncrkindia) 
#  * @project Link-Wise Analytics - Unified Standalone Bundle
#  */
set -e

# --- MariaDB Initialization ---
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "First boot: Initializing MariaDB..."
    mariadb-install-db --user=mysql --datadir=/var/lib/mysql
    
    /usr/bin/mysqld_safe --datadir=/var/lib/mysql &
    pid="$!"

    # Wait for server
    for i in {30..0}; do
        if mariadb-admin ping --silent; then break; fi
        sleep 1
    done

    echo "Configuring Platform Databases (Standalone)..."
    # 1. Link-Wise App DB
    mariadb -e "CREATE DATABASE IF NOT EXISTS linkwise;"
    mariadb -e "GRANT ALL PRIVILEGES ON linkwise.* TO 'linkwise_user'@'localhost' IDENTIFIED BY 'linkwise_pass';"
    mariadb -e "GRANT ALL PRIVILEGES ON linkwise.* TO 'linkwise_user'@'%' IDENTIFIED BY 'linkwise_pass';"
    mariadb linkwise < /app/src/lib/mysql-schema.sql

    # 2. Keycloak System DB
    mariadb -e "CREATE DATABASE IF NOT EXISTS keycloak;"
    mariadb -e "GRANT ALL PRIVILEGES ON keycloak.* TO 'keycloak_user'@'localhost' IDENTIFIED BY 'keycloak_pass';"
    mariadb -e "GRANT ALL PRIVILEGES ON keycloak.* TO 'keycloak_user'@'%' IDENTIFIED BY 'keycloak_pass';"
    
    mariadb -e "FLUSH PRIVILEGES;"
    kill "$pid"
    wait "$pid"
fi

# --- Keycloak Build (Optimized) ---
echo "Optimizing identity provider for standalone deployment..."
/opt/keycloak/bin/kc.sh build --db=mariadb --health-enabled=true

# --- Hand-off to Supervisor ---
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
