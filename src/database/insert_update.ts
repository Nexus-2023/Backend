import {
  Validator,
  validatorSubgraphResult,
  Block,
  DatabaseConfig,
  nodeOperator,
  ValidatorData,
  subgraphValidator,
} from "../types"

import { arraysEqual, calculateScore } from "../utils"

import {
  GET_VALIDATORS,
  GET_BLOCKS,
  GET_NODEOPERATORS,
  GET_VALIDATOR_BY_INDEX,
} from "./query"
import { ENV, API_ENDPOINTS } from "../utils/constants"

import { executeQuery } from "./query"
import { consensusDataApi } from "../connectors/consensus_connector"

/* @Developer
    This function, POST_VALIDATORS, is responsible for posting data fetched from the subgraph to the Validators table.
    The function retrieves the existing validators from the database using GET_VALIDATORS.
    It then iterates through each validator from the subgraph, checking if the validator with the same public key already exists in the database.
    If the validator doesn't exist and its status is "ValidatorActivated," the function fetches additional data from an consensus API using the validator's public key.
    The fetched data is then processed and inserted into the Validators table using the INSERT_VALIDATOR function.

    @param {validatorSubgraphResult} - An array of subgraphValidator objects containing data fetched from the subgraph.

*/

// TODO propoer res type
export async function POST_VALIDATORS({
  subgraphValidator,
  res,
}: {
  subgraphValidator: subgraphValidator
  res: any
}) {
  try {
    const validatorResult = res.data

    const validator: Validator = {
      public_key: validatorResult.validator.pubkey,
      validator_index: validatorResult.index,
      cluster_id: subgraphValidator.clusterId,
      balance: validatorResult.balance,
      status: subgraphValidator.status,
      score: calculateScore(
        validatorResult.balance,
        validatorResult.validator.slashed
      ),
      rollupname: subgraphValidator.rollup,
    }

    await INSERT_VALIDATOR({ validator })
  } catch (error) {
    console.error("Error fetching or posting validator data:", error)
  }
}

export async function POST_BLOCK(res: any) {
  try {
    const blocksData = res.data

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
          finalized: blocksData.finalized,
        }

        await INSERT_BLOCK({ Block })
        console.log("POST_BLOCK successfull ")

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
     The FETCH_AND_UPDATE_VALIDATORS function is responsible for fetching and updating information
     about validators from an external API (consensus API) and updating the database with the latest data.
     
     It begins by retrieving the existing validator data from the database using the GET_VALIDATORS function.
     For each existing validator, it constructs the API URL using the validator's public key and makes a GET request
     to the external API to fetch the latest information about the validator.
     If the external API request is successful and the returned data is not an empty array, it extracts relevant
     information, such as public key, balance, status, and calculates the score using the calculateScore function.
  
  */
// export async function FETCH_AND_UPDATE_VALIDATORS(res: any) {
//   const existingValidators = await GET_VALIDATORS()

//   for (const existingValidator of existingValidators) {
//     // const publicKey = existingValidator.public_key

//     try {
//       // const apiUrl = API_ENDPOINTS.BEACON_VALIDATOR(publicKey)
//       // const res = await consensusDataApi(apiUrl)

//       const cond = res.data && res.data.length > 0

//       if (cond) {
//         const validatorResult = res.data

//         const validator: any = {
//           public_key: validatorResult[0].validator.pubkey,
//           balance: validatorResult[0].balance,
//           status: validatorResult[0].status,
//           score: calculateScore(
//             validatorResult[0].balance,
//             validatorResult[0].validator.slashed
//           ),
//         }

//         await UPDATE_VALIDATOR({ validator })
//       } else {
//         console.log(
//           "public key is invalid , could not fetch from consensus api"
//         )
//       }
//     } catch (error) {
//       console.error("Error updating validator data:", error)
//     }
//   }
// }

export async function POST_UPDATE_VALIDATORS(res: any) {
  const cond = res.data && res.data.length > 0

  if (cond) {
    const validatorResult = res.data

    const validator: any = {
      public_key: validatorResult[0].validator.pubkey,
      balance: validatorResult[0].balance,
      status: validatorResult[0].status,
      score: calculateScore(
        validatorResult[0].balance,
        validatorResult[0].validator.slashed
      ),
    }

    await UPDATE_VALIDATOR({ validator })
  } else {
    console.log("public key is invalid , could not fetch from consensus api")
  }
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
