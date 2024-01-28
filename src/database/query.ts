import { DatabaseConfig, Validator, Block, nodeOperator } from "../types"
import { ENV } from "../utils/constants"

import { getClient, releaseClient } from "./connection"

async function executeQuery(
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

export async function INSERT_VALIDATOR({
  validator,
}: {
  validator: Validator
}) {
  const query = `
      INSERT INTO VALIDATORS (public_key, validator_index, cluster_id, balance, status, last_update_time, score, rollupname)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7) RETURNING *`
  return await executeQuery(query, [
    validator.public_key,
    validator.validator_index,
    validator.cluster_id,
    validator.balance,
    validator.status,
    validator.score,
    validator.rollupname,
  ])
}

export async function INSERT_BLOCK({ Block }: { Block: Block }) {
  const query = `
      INSERT INTO BLOCKS (block_number, block_proposer, slot, validator_exit, withdrawals, proposer_slashings, finalized, last_update_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP) RETURNING *`
  return await executeQuery(query, [
    Block.block_number,
    Block.block_proposer,
    Block.slot,
    Block.validator_exit,
    Block.withdrawals,
    Block.proposer_slashings,
    Block.finalized,
  ])
}

export async function INSERT_NODEOPERATORS({
  nodeOperator,
}: {
  nodeOperator: nodeOperator
}) {
  const query = `
      INSERT INTO NODEOPERATORS (public_key, name, validator_count, score, last_update_time, node_operator_id, cluster_id)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6) RETURNING *`
  return await executeQuery(query, [
    nodeOperator.public_key,
    nodeOperator.name,
    nodeOperator.validator_count,
    nodeOperator.score,
    nodeOperator.node_operator_id,
    nodeOperator.cluster_id,
  ])
}

export async function UPDATE_VALIDATOR({
  validator,
}: {
  validator: Validator
}): Promise<any> {
  const query = `
      UPDATE validators
      SET balance = $1, status = $2, score = $3, last_update_time = CURRENT_TIMESTAMP
      WHERE public_key = $4
      RETURNING *`

  return await executeQuery(query, [
    validator.balance,
    validator.status,
    validator.score,
    validator.public_key,
  ])
}
