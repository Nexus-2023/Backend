import { DatabaseConfig } from "../types"
import { ENV } from "../utils/constants"

import { getClient, releaseClient } from "./connection"

/* @Developer
    This function, databaseSetup, is responsible for setting up the entire database infrastructure.    
    It orchestrates the creation of the database, schema, and relevant tables, including Validators, Blocks, and NodeOperators.
    The sequence of actions ensures that the database and schema are created before creating individual tables.
    Any errors during the setup process are logged.
    
    Note: The function is expected to be run once during the initial setup of the application.    
*/

export async function databaseSetup() {
  try {
    await createDatabase()
    await SchemaSetup()
    await createValidatorsTable()
    await createBlocksTable()
    await createNodeOperatorTable()
    console.error("databaseSetup successfull")
  } catch (error) {
    console.error("Error in databaseSetup:", error)
  }
}

/* @Developer
      This function, createDatabase, is responsible for creating the PostgreSQL database if it doesn't already exist.    
      It connects to the default "postgres" database to execute the creation query.
      If the specified database name (ENV.DB_DATABASENAME) doesn't exist, it creates the database.        
  */
export async function createDatabase() {
  const client = await getClient()

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

      releaseClient(client)
    } else {
      console.log("client does not exists")
    }
  } catch (error) {
    console.error("Error in createDatabase:", error)
  }
}

/* @Developer
      This function, SchemaSetup, is responsible for creating the specified schema in the PostgreSQL database.    
      It connects to the database and checks if the schema already exists.
      If the schema doesn't exist, it creates the schema.        
  */

async function SchemaSetup() {
  const client = await getClient()

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

      releaseClient(client)
    } else {
      console.log("client does not exists")
    }
  } catch (error) {
    console.error("Error in schemaSetup:", error)
  }
}

async function checkSchemaExists(client: any): Promise<boolean> {
  const schemaCheckQuery = `
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name = '${ENV.DB_SCHEMA}';
    `
  const result = await client.query(schemaCheckQuery)
  return result.rowCount > 0
}

async function checkTableExists(
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

async function createTableIfNotExists(
  client: any,
  tableName: string,
  createTableQuery: string
) {
  const schemaExists = await checkSchemaExists(client)
  if (!schemaExists) {
    console.error(
      `${ENV.DB_SCHEMA} schema not found. Please run SchemaSetup function first.`
    )
    return
  }

  const tableExists = await checkTableExists(client, tableName)
  if (!tableExists) {
    console.log(`${tableName} table not found, creating it.`)
    await client.query(createTableQuery)
    console.log(`Created ${tableName} table.`)
  } else {
    console.log(`${tableName} table already exists.`)
  }
}

/* @Developer
    This function, createValidatorsTable, is responsible for creating the Validators table within the specified schema.    
    It connects to the database, checks if the specified schema exists, and then checks if the Validators table already exists.
    If the table doesn't exist, it creates the Validators table with the required columns.   
*/

async function createValidatorsTable() {
  const client = await getClient()
  try {
    if (client) {
      await createTableIfNotExists(
        client,
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
          rollup TEXT  NOT NULL
          );
        `
      )
      releaseClient(client)
    } else {
      console.log("client does not exist")
    }
  } catch (error) {
    console.error("Error in createValidatorsTable:", error)
  }
}

async function createBlocksTable() {
  const client = await getClient()
  try {
    if (client) {
      await createTableIfNotExists(
        client,
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
      releaseClient(client)
    } else {
      console.log("client does not exist")
    }
  } catch (error) {
    console.error("Error in createBLOCKSTable:", error)
  }
}

async function createNodeOperatorTable() {
  const client = await getClient()
  try {
    if (client) {
      await createTableIfNotExists(
        client,
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
      releaseClient(client)
    } else {
      console.log("client does not exist")
    }
  } catch (error) {
    console.error("Error in createBLOCKSTable:", error)
  }
}
