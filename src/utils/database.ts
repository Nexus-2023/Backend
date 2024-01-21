import { API_ENDPOINTS, ENV } from "./constants"
import {
  Validator,
  validatorSubgraphResult,
  Block,
  DatabaseConfig,
  nodeOperator,
  ValidatorData,
  subgraphValidator,
} from "../types"

import {
  getLatestValidatorSubgraphResult,
  arraysEqual,
  calculateScore,
} from "."
import { Client, Pool } from "pg"
import { escapeToBuffer } from "hono/utils/html"

/* @Developer
    This function, GET_VALIDATORS, retrieves all rows from the VALIDATORS table in the database.    
    The function establishes a connection to the database using a connection pool and fetches the data using a simple SELECT query.
    The obtained rows are returned as an array.

    @returns {Promise<Array>} - A promise that resolves with an array containing all rows from the VALIDATORS table.
    @throws Error - If there is an issue with the database query or fetching process.

*/
export async function GET_VALIDATORS(): Promise<Array<any>> {
  const dbConfig: DatabaseConfig = {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    database: ENV.DB_DATABASENAME,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
  }
  const pool = new Pool(dbConfig)

  const client = await pool.connect()
  try {
    const result = await client.query("SELECT * FROM VALIDATORS;")

    return result.rows
  } catch (error) {
    console.error("Error in GET_VALIDATORS:", error)
    throw error
  } finally {
    if (client) {
      client.release()
      console.log("Database connection released")
    }
  }
}

/* @Developer
    This function, GET_VALIDATOR_BY_INDEX, returns a validator from our Database with a given validator index         
*/
export async function GET_VALIDATOR_BY_INDEX(
  validatorIndex: number
): Promise<Array<any>> {
  const dbConfig: DatabaseConfig = {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    database: ENV.DB_DATABASENAME,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
  }
  const pool = new Pool(dbConfig)

  const client = await pool.connect()
  try {
    const result = await client.query(
      "SELECT * FROM VALIDATORS WHERE validator_index = $1;",
      [validatorIndex]
    )

    return result.rows
  } catch (error) {
    console.error("Error in GET_VALIDATORS_BY_INDEX:", error)
    throw error
  } finally {
    if (client) {
      client.release()
      console.log("Database connection released")
    }
  }
}

/* @Developer
    This function, GET_BLOCKS, retrieves all rows from the BLOCKS table in the database.    
    The function establishes a connection to the database using a connection pool and fetches the data using a simple SELECT query.
    The obtained rows are returned as an array.

    @returns {Promise<Array>} - A promise that resolves with an array containing all rows from the BLOCKS table.
    @throws Error - If there is an issue with the database query or fetching process.

*/
export async function GET_BLOCKS(): Promise<Array<any>> {
  const dbConfig: DatabaseConfig = {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    database: ENV.DB_DATABASENAME,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
  }
  const pool = new Pool(dbConfig)

  const client = await pool.connect()
  try {
    const result = await client.query("SELECT * FROM BLOCKS;")

    return result.rows
  } catch (error) {
    console.error("Error in GET_BLOCKS:", error)
    throw error
  } finally {
    if (client) {
      client.release()
      console.log("Database connection released")
    }
  }
}

/* @Developer
    This function, GET_NODEOPERATORS, retrieves all rows from the NODEOPERATORS table in the database.    
    The function establishes a connection to the database using a connection pool and fetches the data using a simple SELECT query.
    The obtained rows are returned as an array.

    @returns {Promise<Array>} - A promise that resolves with an array containing all rows from the NODEOPERATORS table.
    @throws Error - If there is an issue with the database query or fetching process.

*/
export async function GET_NODEOPERATORS(): Promise<Array<any>> {
  const dbConfig: DatabaseConfig = {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    database: ENV.DB_DATABASENAME,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
  }
  const pool = new Pool(dbConfig)

  const client = await pool.connect()
  try {
    const result = await client.query("SELECT * FROM NODEOPERATORS;")

    return result.rows
  } catch (error) {
    console.error("Error in GET_NODEOPERATORS:", error)
    throw error
  } finally {
    if (client) {
      client.release()
      console.log("Database connection released")
    }
  }
}

/* @Developer
    This function, POST_VALIDATORS, is responsible for posting data fetched from the subgraph to the Validators table.
    The function retrieves the existing validators from the database using GET_VALIDATORS.
    It then iterates through each validator from the subgraph, checking if the validator with the same public key already exists in the database.
    If the validator doesn't exist and its status is "ValidatorActivated," the function fetches additional data from an consensus API using the validator's public key.
    The fetched data is then processed and inserted into the Validators table using the INSERT_VALIDATOR function.

    @param {validatorSubgraphResult} - An array of subgraphValidator objects containing data fetched from the subgraph.

*/
export async function POST_VALIDATORS({
  validatorSubgraphResult,
}: {
  validatorSubgraphResult: subgraphValidator[]
}) {
  const existingValidators = await GET_VALIDATORS()

  for (const subgraphValidator of validatorSubgraphResult) {
    const publicKey = subgraphValidator.id

    const keyExists = existingValidators.some(
      (validator: Validator) => validator.public_key === publicKey
    )

    if (!keyExists && subgraphValidator.status === "ValidatorActivated") {
      const apiUrl = API_ENDPOINTS.BEACON_VALIDATOR(publicKey)

      try {
        const externalApiResult = await fetch(apiUrl, {
          method: "GET",
        })

        if (!externalApiResult.ok) {
          throw new Error(
            `Failed to fetch validator data. Status: ${externalApiResult.status}`
          )
        }

        const externalApiData = await externalApiResult.json()

        const externalValidators = externalApiData.data

        for (const externalValidator of externalValidators) {
          const validator: Validator = {
            public_key: externalValidator.validator.pubkey,
            validator_index: externalValidator.index,
            cluster_id: subgraphValidator.clusterId,
            balance: externalValidator.balance,
            status: subgraphValidator.status,
            score: calculateScore(
              externalValidator.balance,
              externalValidator.validator.slashed
            ),
            rollupname: subgraphValidator.rollup,
          }

          await INSERT_VALIDATOR({ validator })
        }
      } catch (error) {
        console.error("Error fetching or posting validator data:", error)
      }
    } else {
      console.log(
        `Validator with public key ${publicKey} already exists. or validator is not activated`
      )
    }
  }
}

export async function POST_NODEOPERATORS({
  nodeOperatorSubgraphResult,
}: {
  nodeOperatorSubgraphResult: any
}) {
  const existingnodeOperators = await GET_NODEOPERATORS()

  for (const subgraphnodeOperator of nodeOperatorSubgraphResult) {
    const publicKey = subgraphnodeOperator.id

    const keyExists = existingnodeOperators.some(
      (nodeOperator: nodeOperator) => nodeOperator.public_key === publicKey
    )

    if (!keyExists) {
      try {
        const nodeOperator: nodeOperator = {
          public_key: nodeOperatorSubgraphResult.public_key,
          name: nodeOperatorSubgraphResult.name,
          validator_count: nodeOperatorSubgraphResult.validator_count,

          score: 99,
          node_operator_id: nodeOperatorSubgraphResult.node_operator_id,
          cluster_id: nodeOperatorSubgraphResult.cluster_id,
        }

        await INSERT_NODEOPERATORS({ nodeOperator })
      } catch (error) {
        console.error("Error posting node operator data:", error)
      }
    } else {
      console.log(`nodeOperator with public key ${publicKey} already exists.`)
    }
  }
}

/* @Developer
    This function, INSERT_VALIDATOR, inserts a single validator into the Validators table.    
    The function uses a provided validator object and inserts its attributes into the database.
    It utilizes the node-postgres npm pg library to interact with the PostgreSQL database.

    @param {validator} - A validator object containing the necessary attributes (public_key, validator_index, cluster_id, balance, status, score, rollupname).  
    @returns {Promise<QueryResult>} - A promise that resolves with the result of the database insertion operation.
    @throws Error - If there is an issue with the database query or insertion process.
    Note: The function uses the Pool object from node-postgres to manage database connections efficiently. The client is released back to the pool after execution.
*/
export async function INSERT_VALIDATOR({
  validator,
}: {
  validator: Validator
}) {
  const dbConfig: DatabaseConfig = {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    database: ENV.DB_DATABASENAME,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
  }
  const pool = new Pool(dbConfig)

  const client = await pool.connect()
  try {
    const result = await client.query(
      "INSERT INTO VALIDATORS (public_key, validator_index, cluster_id, balance, status, last_update_time, score, rollupname) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7) RETURNING *",
      [
        validator.public_key,
        validator.validator_index,
        validator.cluster_id,
        validator.balance,
        validator.status,
        validator.score,
        validator.rollupname,
      ]
    )

    console.error("Validator data inserted successfully")
    return result
  } catch (error) {
    console.error("Error in POST_VALIDATORS:", error)
    throw error
  } finally {
    if (client) {
      client.release()
      console.log("Database connection released")
    }
  }
}

export async function INSERT_BLOCK({ Block }: { Block: Block }) {
  const dbConfig: DatabaseConfig = {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    database: ENV.DB_DATABASENAME,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
  }
  const pool = new Pool(dbConfig)

  const client = await pool.connect()
  try {
    const result = await client.query(
      "INSERT INTO BLOCKS (block_number, block_proposer , slot,validator_exit, withdrawals, proposer_slashings , finalized, last_update_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9  , CURRENT_TIMESTAMP) RETURNING *",
      [
        Block.block_number,
        Block.block_proposer,
        Block.slot,
        Block.validator_exit,
        Block.withdrawals,
        Block.proposer_slashings,
        Block.finalized,
      ]
    )

    console.error("block data inserted successfully")
    return result
  } catch (error) {
    console.error("Error in insert_block:", error)
    throw error
  } finally {
    if (client) {
      client.release()
      console.log("Database connection released")
    }
  }
}

export async function INSERT_NODEOPERATORS({
  nodeOperator,
}: {
  nodeOperator: nodeOperator
}) {
  const dbConfig: DatabaseConfig = {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    database: ENV.DB_DATABASENAME,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
  }
  const pool = new Pool(dbConfig)

  const client = await pool.connect()
  try {
    const result = await client.query(
      "INSERT INTO NODEOPERATORS (public_key, name , validator_count, score , last_update_time , node_operator_id , cluster_id) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP , $5 , $6) RETURNING *",
      [
        nodeOperator.public_key,
        nodeOperator.name,
        nodeOperator.validator_count,
        nodeOperator.score,
        nodeOperator.node_operator_id,
        nodeOperator.cluster_id,
      ]
    )

    console.error("nodeOperator data inserted successfully")
    return result
  } catch (error) {
    console.error("Error in insert_nodeOperator:", error)
    throw error
  } finally {
    if (client) {
      client.release()
      console.log("Database connection released")
    }
  }
}

/* @Developer
   The FETCH_AND_UPDATE_VALIDATORS function is responsible for fetching and updating information
   about validators from an external API (consensus API) and updating the database with the latest data.
   
   It begins by retrieving the existing validator data from the database using the GET_VALIDATORS function.
   For each existing validator, it constructs the API URL using the validator's public key and makes a GET request
   to the external API to fetch the latest information about the validator.
   If the external API request is successful and the returned data is not an empty array, it extracts relevant
   information, such as public key, balance, status, and calculates the score using the calculateScore function.

*/
export async function FETCH_AND_UPDATE_VALIDATORS() {
  const existingValidators = await GET_VALIDATORS()

  for (const existingValidator of existingValidators) {
    const publicKey = existingValidator.public_key

    const apiUrl = API_ENDPOINTS.BEACON_VALIDATOR(publicKey)

    try {
      const externalApiResult = await fetch(apiUrl, {
        method: "GET",
      })

      if (!externalApiResult.ok) {
        throw new Error(
          `Failed to fetch validator data. Status: ${externalApiResult.status}`
        )
      }

      const externalApiData = await externalApiResult.json()
      const cond = externalApiData.data && externalApiData.data.length > 0

      if (cond) {
        const externalValidator = externalApiData.data

        const validator: any = {
          public_key: externalValidator[0].validator.pubkey,
          balance: externalValidator[0].balance,
          status: externalValidator[0].status,
          score: calculateScore(
            externalValidator[0].balance,
            externalValidator[0].validator.slashed
          ),
        }

        await UPDATE_VALIDATOR({ validator })
      } else {
        console.log(
          "public key is invalid , could not fetch from consensus api"
        )
      }
    } catch (error) {
      console.error("Error updating validator data:", error)
    }
  }
}

/* @Developer
    This function, UPDATE_VALIDATOR, is responsible for updating information about a specific validator in the database.    
    It connects to the database using a connection pool and executes an SQL UPDATE query to modify the balance, status, score,
    and last_update_time fields of the specified validator based on its public key.    
    @returns {Promise<any>} - A promise that resolves with the updated validator data.

*/
export async function UPDATE_VALIDATOR({
  validator,
}: {
  validator: Validator
}): Promise<any> {
  const dbConfig: DatabaseConfig = {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    database: ENV.DB_DATABASENAME,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
  }
  const pool = new Pool(dbConfig)

  const client = await pool.connect()
  try {
    const result = await pool.query(
      "UPDATE validators SET balance = $1, status = $2, score = $3 , last_update_time = NOW() WHERE public_key = $4 RETURNING *",
      [
        validator.balance,
        validator.status,
        validator.score,
        validator.public_key,
      ]
    )

    console.error("Validator data updated successfully")
    return result
  } catch (error) {
    console.error("Error in UPDATE_VALIDATORS:", error)
    throw error
  } finally {
    if (client) {
      client.release()
      console.log("Database connection released")
    }
  }
}

export async function FETCH_AND_INSERT_BLOCK() {
  const apiUrl = API_ENDPOINTS.BEACON_BLOCKS

  try {
    const externalApiResult = await fetch(apiUrl, {
      method: "GET",
    })

    if (!externalApiResult.ok) {
      throw new Error(
        `Failed to fetch blocks data. Status: ${externalApiResult.status}`
      )
    }

    const externalApiData = await externalApiResult.json()

    const blocksData = externalApiData.data
    // console.log("blocksData", blocksData)

    const blockProposer = blocksData.message.proposer_index

    const proposedValidator = await GET_VALIDATOR_BY_INDEX(blockProposer)
    if (proposedValidator && proposedValidator.length > 0) {
      console.log(
        "Block proposer is from one of our validators:",
        proposedValidator[0].public_key
      )
      if (blockProposer === proposedValidator[0].validator_index) {
        const Block = {
          block_number: blocksData.message.body.execution_payload.block_number,
          block_proposer: blocksData.message.proposer_index,
          slot: blocksData.message.slot,
          validator_exit: blocksData.message.body.deposits.voluntary_exits, // [] extract further
          withdrawals: blocksData.message.body.execution_payload.withdrawals, // [] extract further
          proposer_slashings: blocksData.message.body.proposer_slashings, // []
          finalized: externalApiData.finalized,
        }

        await INSERT_BLOCK({ Block })
        console.log("FETCH_AND_INSERT_BLOCK successfull ")

        return
      } else {
        console.log("Error blockproposer does not match validator index")
        return
      }
    } else {
      console.log("Block proposer is not from one of our validators.")
    }
  } catch (error) {
    console.error("Error in blockinsert() ", error)
  }
}

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

/* @Testing
    This function, connectionTestDatabase, is a utility for testing the connection to the database.     
*/
export async function connectionTestDatabase() {
  const dbConfig: DatabaseConfig = {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
    database: ENV.DB_DATABASENAME,
  }

  try {
    const pool = new Pool(dbConfig)
    const client = await pool.connect()
    console.log("Connected to database:", dbConfig)

    console.error("connectionTestDatabase successfull")
  } catch (error) {
    console.error("Error in connectionTestDatabase:", error)
  }
}

/* @Developer
    This function, createDatabase, is responsible for creating the PostgreSQL database if it doesn't already exist.    
    It connects to the default "postgres" database to execute the creation query.
    If the specified database name (ENV.DB_DATABASENAME) doesn't exist, it creates the database.        
*/
export async function createDatabase() {
  const client = new Client({
    host: ENV.DB_HOST,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
    port: ENV.DB_PORT,
  })

  try {
    const connectionStatus = await client.connect()
    console.log("connectionStatus", connectionStatus)

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
  } catch (error) {
    console.error("Error in createDatabase:", error)
  } finally {
    await client.end()
  }
}

/* @Developer
    This function, SchemaSetup, is responsible for creating the specified schema in the PostgreSQL database.    
    It connects to the database and checks if the schema already exists.
    If the schema doesn't exist, it creates the schema.        
*/

export async function SchemaSetup() {
  const client = new Client({
    host: ENV.DB_HOST,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
    port: ENV.DB_PORT,
  })

  try {
    await client.connect()

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
  } catch (error) {
    console.error("Error in schemaSetup:", error)
  } finally {
    await client.end()
  }
}

/* @Developer
    This function, createValidatorsTable, is responsible for creating the Validators table within the specified schema.    
    It connects to the database, checks if the specified schema exists, and then checks if the Validators table already exists.
    If the table doesn't exist, it creates the Validators table with the required columns.   
*/

export async function createValidatorsTable() {
  const client = new Client({
    host: ENV.DB_HOST,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
    port: ENV.DB_PORT,
  })

  try {
    await client.connect()

    const schemaCheckQuery = `
  SELECT schema_name
  FROM information_schema.schemata
  WHERE schema_name = '${ENV.DB_SCHEMA}';
`

    const schemaCheckResult = await client.query(schemaCheckQuery)
    if (schemaCheckResult.rowCount === 0) {
      console.error(
        `${ENV.DB_SCHEMA} schema not found. Please run SchemaSetup function first.`
      )
      return
    }

    // Check if the table exists
    const tableCheckQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${ENV.DB_SCHEMA}'
      AND table_name = 'VALIDATORS';
    `

    const tableCheckResult = await client.query(tableCheckQuery)

    if (tableCheckResult.rowCount === 0) {
      console.log("Validators table not found, creating it.")

      // Create the Validators table query
      const createTableQuery = `
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

      await client.query(createTableQuery)

      console.log("Created Validators table.")
    } else {
      console.log("Validators table already exists.")
    }
  } catch (error) {
    console.error("Error in createValidatorsTable:", error)
  } finally {
    await client.end()
  }
}

/* @Developer
    This function, createBlocksTable, is responsible for creating the Blocks table within the specified schema.    
    It connects to the database, checks if the specified schema exists, and then checks if the Blocks table already exists.
    If the table doesn't exist, it creates the Blocks table with the required columns.
*/
export async function createBlocksTable() {
  const client = new Client({
    host: ENV.DB_HOST,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
    port: ENV.DB_PORT,
  })

  try {
    await client.connect()

    const schemaCheckQuery = `
  SELECT schema_name
  FROM information_schema.schemata
  WHERE schema_name = '${ENV.DB_SCHEMA}';
`

    const schemaCheckResult = await client.query(schemaCheckQuery)
    if (schemaCheckResult.rowCount === 0) {
      console.error(
        `${ENV.DB_SCHEMA} schema not found. Please run SchemaSetup function first.`
      )
      return
    }

    // Check if the table exists
    const tableCheckQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${ENV.DB_SCHEMA}'
      AND table_name = 'BLOCKS';
    `

    const tableCheckResult = await client.query(tableCheckQuery)

    if (tableCheckResult.rowCount === 0) {
      console.log("BLOCKS table not found, creating it.")

      // Create the BLOCKS table query
      const createTableQuery = `
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

      await client.query(createTableQuery)

      console.log("Created BLOCKS table.")
    } else {
      console.log("BLOCKS table already exists.")
    }
  } catch (error) {
    console.error("Error in createBLOCKSTable:", error)
  } finally {
    await client.end()
  }
}

/* @Developer
    This function, createNodeOperatorTable, is responsible for creating the NodeOperators table within the specified schema.
    It connects to the database, checks if the specified schema exists, and then checks if the NodeOperators table already exists.
    If the table doesn't exist, it creates the NodeOperators table with the required columns.
*/
export async function createNodeOperatorTable() {
  const client = new Client({
    host: ENV.DB_HOST,
    user: ENV.DB_USERNAME,
    password: ENV.DB_PASSWORD,
    port: ENV.DB_PORT,
  })

  try {
    await client.connect()

    const schemaCheckQuery = `
  SELECT schema_name
  FROM information_schema.schemata
  WHERE schema_name = '${ENV.DB_SCHEMA}';
`

    const schemaCheckResult = await client.query(schemaCheckQuery)
    if (schemaCheckResult.rowCount === 0) {
      console.error(
        `${ENV.DB_SCHEMA} schema not found. Please run SchemaSetup function first.`
      )
      return
    }

    // Check if the table exists
    const tableCheckQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = '${ENV.DB_SCHEMA}'
      AND table_name = 'NODEOPERATORS';
    `

    const tableCheckResult = await client.query(tableCheckQuery)

    if (tableCheckResult.rowCount === 0) {
      console.log("NODEOPERATORS table not found, creating it.")

      // Create the NODEOPERATORS table query
      const createTableQuery = `
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

      await client.query(createTableQuery)

      console.log("Created NODEOPERATORS table.")
    } else {
      console.log("NODEOPERATORS table already exists.")
    }
  } catch (error) {
    console.error("Error in createNodeOperatorTable:", error)
  } finally {
    await client.end()
  }
}
