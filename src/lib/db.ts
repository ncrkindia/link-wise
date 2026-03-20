/**
 * @file db.ts
 * @description MySQL connection pool singleton for the Link-Wise application.
 *
 * This module creates a shared `mysql2` connection pool using the `DATABASE_URL`
 * environment variable. Using a pool (rather than a single connection) allows
 * concurrent requests to reuse database connections efficiently without the
 * overhead of establishing a new connection per query.
 *
 * Connection string format:
 *   mysql://user:password@hostname:port/database_name
 */
import mysql from 'mysql2/promise';

const pool = mysql.createPool(process.env.DATABASE_URL || 'mysql://root:@localhost:3306/linkwise');

/**
 * Executes a parameterized SQL query against the shared MySQL pool.
 *
 * Uses prepared statements via `pool.execute()` to prevent SQL injection.
 * The generic type parameter `T` allows callers to type the result rows.
 *
 * @template T - The expected shape of each result row.
 * @param sql    - The SQL query string with `?` placeholders.
 * @param params - Optional array of values bound to the query placeholders.
 * @returns A promise that resolves to the query result cast to `T`.
 *
 * @example
 * const users = await query<User[]>('SELECT * FROM users WHERE id = ?', [email]);
 */
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const [results] = await pool.execute(sql, params);
  return results as T;
}

export default pool;

