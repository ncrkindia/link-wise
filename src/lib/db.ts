import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

/**
 * Creates a shared `mysql2` connection pool using the `DATABASE_URL`
 * environment variable. 
 */
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/linkwise',
  multipleStatements: true, // Required for executing the multi-statement schema script
});

/**
 * Automatically initializes the database schema if the `users` table is missing.
 * Reads the schema definition from `src/lib/mysql-schema.sql`.
 */
async function initSchema() {
  try {
    // Check if the schema is already initialized
    const [tables] = await pool.query("SHOW TABLES LIKE 'users'");
    if ((tables as any[]).length === 0) {
      echo("DB: Initializing required schema (First Startup)...");
      
      const schemaPath = path.join(process.cwd(), 'src/lib/mysql-schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schema = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schema);
        echo("DB: Schema successfully provisioned.");
      } else {
        console.warn("DB WARNING: mysql-schema.sql not found at", schemaPath);
      }
    }
  } catch (error) {
    console.error("DB ERROR: Failed to initialize schema:", error);
  }
}

// Simple helper for logging
function echo(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

// Trigger lazy-styled initialization
// This will run asynchronously in the background when the module is first loaded
initSchema();

/**
 * Executes a parameterized SQL query against the shared MySQL pool.
 */
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const [results] = await pool.execute(sql, params);
  return results as T;
}

export default pool;

