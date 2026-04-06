const mysql = require('mysql2/promise');

async function migrate() {
  const url = "mysql://linkwise_user:linkwise_pass@localhost:3306/linkwise"; // Assuming localhost if on host
  try {
    console.log("Connecting to database...");
    const connection = await mysql.createConnection(url);
    console.log("Updating email_accounts schema...");
    await connection.execute("ALTER TABLE email_accounts ADD COLUMN sender_name VARCHAR(255) AFTER username;");
    console.log("Database schema updated successfully.");
    await connection.end();
  } catch (e) {
    if (e.message.includes("Duplicate column name")) {
      console.log("Column 'sender_name' already exists.");
    } else if (e.message.includes("ECONNREFUSED")) {
       console.log("Could not connect to localhost. Trying host.docker.internal...");
       try {
         const connection = await mysql.createConnection("mysql://linkwise_user:linkwise_pass@host.docker.internal:3306/linkwise");
         await connection.execute("ALTER TABLE email_accounts ADD COLUMN sender_name VARCHAR(255) AFTER username;");
         console.log("Database schema updated successfully (via host.docker.internal).");
         await connection.end();
       } catch (e2) {
         console.error("Migration failed:", e2.message);
       }
    } else {
      console.error("Migration failed:", e.message);
    }
  }
}

migrate();
