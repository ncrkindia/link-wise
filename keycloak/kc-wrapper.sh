#!/bin/bash
set -e

# Wait for MariaDB to be ready
echo "Waiting for MariaDB (localhost:3306) to be ready..."
while ! nc -z localhost 3306; do
  sleep 1
done

echo "MariaDB is ready; starting Keycloak..."

# Set default hostname if not provided (required for non-dev start)
export KC_HOSTNAME=${KC_HOSTNAME:-localhost}

# Execute Keycloak
exec /opt/keycloak/bin/kc.sh start "$@"
