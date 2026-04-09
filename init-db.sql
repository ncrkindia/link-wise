-- Create additional databases required for the modular stack
CREATE DATABASE IF NOT EXISTS linkwise;
CREATE DATABASE IF NOT EXISTS keycloak;

-- Ensure users have access
GRANT ALL PRIVILEGES ON linkwise.* TO 'linkwise_user'@'%';
GRANT ALL PRIVILEGES ON keycloak.* TO 'linkwise_user'@'%';
FLUSH PRIVILEGES;
