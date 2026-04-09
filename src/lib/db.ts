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

let initializationPromise: Promise<void> | null = null;

/**
 * Ensures the database schema is initialized exactly once.
 * This is called lazily by the `query` function to avoid connection attempts
 * during the build phase unless a query is actually required.
 */
async function ensureInitialized() {
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      // Check if the users table exists (simplistic check for schema readiness)
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
    } catch (error: any) {
      // Handle connection errors gracefully, especially during build or cold starts
      if (error.code === 'ECONNREFUSED') {
        // Log as info/warning during startup/build to avoid noisy stack traces
        console.warn(`[${new Date().toISOString()}] DB: Connection refused (Database may be starting up or unreachable).`);
      } else {
        console.error("DB ERROR: Failed to initialize schema:", error);
      }
      // Reset the promise so we can retry on the next query if it failed
      initializationPromise = null;
    }
  })();

  return initializationPromise;
}

// Simple helper for logging
function echo(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

/**
 * Executes a parameterized SQL query against the shared MySQL pool.
 * Automatically triggers schema initialization on the first call.
 */
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  await ensureInitialized();
  const [results] = await pool.execute(sql, params);
  return results as T;
}

export default pool;

