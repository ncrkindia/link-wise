# --- MariaDB Initialization ---
if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "First boot: Initializing MariaDB..."
    mariadb-install-db --user=mysql --datadir=/var/lib/mysql
    
    # Start temporary server to import schema
    /usr/bin/mysqld_safe --datadir=/var/lib/mysql &
    pid="$!"

    # Wait for server
    for i in {30..0}; do
        if mariadb-admin ping --silent; then break; fi
        sleep 1
    done

    # Run initialization SQL
    echo "Importing schema..."
    mariadb -e "CREATE DATABASE IF NOT EXISTS linkwise;"
    mariadb -e "GRANT ALL PRIVILEGES ON linkwise.* TO 'linkwise_user'@'localhost' IDENTIFIED BY 'linkwise_pass';"
    mariadb -e "GRANT ALL PRIVILEGES ON linkwise.* TO 'linkwise_user'@'%' IDENTIFIED BY 'linkwise_pass';"
    mariadb -e "FLUSH PRIVILEGES;"
    mariadb linkwise < /app/src/lib/mysql-schema.sql

    # Stop temporary server
    kill "$pid"
    wait "$pid"
fi

# --- Hand-off to Supervisor ---
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
