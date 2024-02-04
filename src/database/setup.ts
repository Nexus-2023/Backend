import { DatabaseConfig } from "../types"
import { ENV } from "../utils/constants"
import { DatabaseConnection } from "./connection"

export class DatabaseSetupManager {
  private DatabaseConnection: DatabaseConnection

  constructor(DatabaseConnection: DatabaseConnection) {
    this.DatabaseConnection = DatabaseConnection
  }

  async databaseSetup() {
    try {
      await this.createDatabase()
      await this.schemaSetup()
      await this.createValidatorsTable()
      await this.createBlocksTable()
      await this.createNodeOperatorTable()
      console.error("databaseSetup successful")
    } catch (error) {
      console.error("Error in databaseSetup:", error)
    }
  }

  private async createDatabase() {
    const client = await this.DatabaseConnection.getClient()

    try {
      if (client) {
        const res = await client.query(
          `SELECT datname FROM pg_catalog.pg_database WHERE datname = '${ENV.DB_DATABASENAME}'`
        )

        if (res.rowCount === 0) {
          console.log(`${ENV.DB_DATABASENAME} database not found, creating it.`)
          await client.query(`CREATE DATABASE "${ENV.DB_DATABASENAME}";`)
          console.log(`created database ${ENV.DB_DATABASENAME}.`)
        } else {
          console.log(`${ENV.DB_DATABASENAME} database already exists.`)
        }

        this.DatabaseConnection.releaseClient(client)
      } else {
        console.log("client does not exist")
      }
    } catch (error) {
      console.error("Error in createDatabase:", error)
    }
  }

  private async schemaSetup() {
    const client = await this.DatabaseConnection.getClient()

    try {
      if (client) {
        const schemaCheckQuery = `
          SELECT schema_name
          FROM information_schema.schemata
          WHERE schema_name = '${ENV.DB_SCHEMA}';
        `

        const res = await client.query(schemaCheckQuery)

        if (res.rowCount === 0) {
          console.log(`${ENV.DB_SCHEMA} schema not found, creating it.`)

          const createSchemaQuery = `
            CREATE SCHEMA "${ENV.DB_SCHEMA}";
          `
          await client.query(createSchemaQuery)
          console.log(`Created schema ${ENV.DB_SCHEMA}.`)
        } else {
          console.log(`${ENV.DB_SCHEMA} schema already exists.`)
        }

        this.DatabaseConnection.releaseClient(client)
      } else {
        console.log("client does not exist")
      }
    } catch (error) {
      console.error("Error in schemaSetup:", error)
    }
  }

  private async createTableIfNotExists(
    tableName: string,
    createTableQuery: string
  ) {
    const client = await this.DatabaseConnection.getClient()
    try {
      if (client) {
        const schemaExists = await this.checkSchemaExists(client)
        if (!schemaExists) {
          console.error(
            `${ENV.DB_SCHEMA} schema not found. Please run schemaSetup function first.`
          )
          return
        }

        const tableExists = await this.checkTableExists(client, tableName)
        if (!tableExists) {
          console.log(`${tableName} table not found, creating it.`)
          await client.query(createTableQuery)
          console.log(`Created ${tableName} table.`)
        } else {
          console.log(`${tableName} table already exists.`)
        }

        this.DatabaseConnection.releaseClient(client)
      } else {
        console.log("client does not exist")
      }
    } catch (error) {
      console.error(`Error in createTableIfNotExists(${tableName}):`, error)
    }
  }

  private async checkSchemaExists(client: any): Promise<boolean> {
    const schemaCheckQuery = `
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name = '${ENV.DB_SCHEMA}';
    `
    const result = await client.query(schemaCheckQuery)
    return result.rowCount > 0
  }

  private async checkTableExists(
    client: any,
    tableName: string
  ): Promise<boolean> {
    const tableCheckQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${ENV.DB_SCHEMA}'
      AND table_name = '${tableName}';
    `
    const result = await client.query(tableCheckQuery)
    return result.rowCount > 0
  }

  private async createValidatorsTable() {
    await this.createTableIfNotExists(
      "VALIDATORS",
      `
        CREATE TABLE "${ENV.DB_SCHEMA}"."VALIDATORS" (
        public_key TEXT PRIMARY KEY,
        index INTEGER NOT NULL,
        cluster_id INTEGER NOT NULL,
        balance INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL,
        last_update_time TIMESTAMP NOT NULL,
        score INTEGER NOT NULL,
        rollup TEXT NOT NULL
        );
      `
    )
  }

  private async createBlocksTable() {
    await this.createTableIfNotExists(
      "BLOCKS",
      `
        CREATE TABLE "${ENV.DB_SCHEMA}"."BLOCKS" (
          block_number INTEGER PRIMARY KEY,
          validator_exit JSONB,
          withdrawals JSONB,
          block_proposer INTEGER NOT NULL,
          proposer_slashing JSONB,
          slot INTEGER NOT NULL,
          finalized BOOLEAN NOT NULL,
          last_update_time TIMESTAMP NOT NULL
        );
      `
    )
  }

  private async createNodeOperatorTable() {
    await this.createTableIfNotExists(
      "NODEOPERATORS",
      `
        CREATE TABLE "${ENV.DB_SCHEMA}"."NODEOPERATORS" (
          public_key TEXT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          validator_count INTEGER NOT NULL,
          score INTEGER ,
          last_update_time TIMESTAMP NOT NULL,
          node_operator_id INTEGER NOT NULL,
          cluster_id INTEGER   
        );
      `
    )
  }
}

// const DatabaseConnection = new DatabaseConnection(dbConfig);
// const databaseSetupManager = new DatabaseSetupManager(DatabaseConnection);
// databaseSetupManager.databaseSetup();
