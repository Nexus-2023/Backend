// database/connection.ts

import { Pool, PoolClient } from "pg"
import { DatabaseConfig } from "../types"
import { ENV } from "../utils/constants"

// Database configuration
const dbConfig: DatabaseConfig = {
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  user: ENV.DB_USERNAME,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_DATABASENAME,
}

// Create a database connection pool
const pool = new Pool(dbConfig)

// Function to get a database client from the pool with authentication
export async function getClient(): Promise<PoolClient | null> {
  // if (authToken === 'valid_token') {
  //   return pool.connect();
  // } else {
  //   console.error('Authentication failed');
  //   return null;
  // }

  if (pool) {
    return pool.connect()
  } else {
    console.error("failed to connect to database pool")
    return null
  }
}

// Function to release the database client back to the pool
export async function releaseClient(client: PoolClient): Promise<void> {
  if (client) {
    console.error("client released")
    client.release()
  } else {
    console.error("failed to release client")
  }
}
