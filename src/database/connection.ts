// database/connection.ts

import { Pool, PoolClient } from "pg"
import { DatabaseConfig } from "../types"

export class DatabaseConnection {
  private pool: Pool

  constructor(config: DatabaseConfig) {
    this.pool = new Pool(config)
  }

  async getClient(): Promise<PoolClient | null> {
    try {
      const client = await this.pool.connect()
      return client
    } catch (error) {
      console.error("Failed to connect to the database pool", error)
      return null
    }
  }

  async releaseClient(client: PoolClient): Promise<void> {
    try {
      console.log("Client released")
      client.release()
    } catch (error) {
      console.error("Failed to release client", error)
    }
  }
}

/* Example Usage:
import dbConfig from "./config"

const databaseManager = new DatabaseManager(dbConfig);

async function exampleUsage() {
  const client = await databaseManager.getClient();
  if (client) {  
    await databaseManager.releaseClient(client);
  }
}  

*/
