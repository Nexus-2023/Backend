import { DatabaseConfig, Validator, Block, nodeOperator } from "../types"
import { ENV } from "../utils/constants"

import { getClient, releaseClient } from "./connection"

export async function executeQuery(
  query: string,
  values?: any[]
): Promise<Array<any>> {
  const client = await getClient()

  try {
    let result

    if (client) {
      result = await client.query(query)
      releaseClient(client)
    }

    return result?.rows || []
  } catch (error) {
    console.error(`Error executing query: ${query}`, error)
    throw error
  }
}

export async function GET_VALIDATORS(): Promise<Array<any>> {
  const query = `SELECT * FROM VALIDATORS;`
  return executeQuery(query)
}

export async function GET_VALIDATOR_BY_INDEX(
  validatorIndex: number
): Promise<Array<any>> {
  const query = `SELECT * FROM VALIDATORS WHERE validator_index = ${validatorIndex};`
  return executeQuery(query)
}

export async function GET_BLOCKS(): Promise<Array<any>> {
  const query = "SELECT * FROM BLOCKS;"
  return executeQuery(query)
}

export async function GET_NODEOPERATORS(): Promise<Array<any>> {
  const query = "SELECT * FROM NODEOPERATORS;"
  return executeQuery(query)
}
