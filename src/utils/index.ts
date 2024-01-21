import {
  GET_ALL_DATA,
  GET_ALL_ROLLUPS,
  GET_ALL_CLUSTERS,
  GET_ALL_NODE_OPERATORS,
  GET_ALL_VALIDATORS,
} from "../subGraphQueries"
import { client } from "../lib/client"
import { request, gql } from "graphql-request"
import { API_ENDPOINTS, ENV } from "../utils/constants"
import {
  validatorSubgraphResult,
  ValidatorData,
  nodeOperatorSubgraph,
  nodeOperatorData,
} from "../types"
import { createHash } from "crypto"

// TODO : Implement CalulateScore
function calculateScore(balance: number, slashed: boolean) {
  const threshold = 32000000000

  if (balance > threshold) {
    return slashed ? 80 : 99
  } else {
    return 50
  }
}

// Function to compare two arrays for equality
function arraysEqual(array1: any, array2: any) {
  return JSON.stringify(array1) === JSON.stringify(array2)
}

const getLatestValidatorSubgraphResult = async () => {
  // const result =  await client.query({ query : GET_ALL_ROLLUPS })
  const result: ValidatorData = await request(
    API_ENDPOINTS.SUBGRAPH,
    GET_ALL_VALIDATORS
  )
  // return result.data.validators
  return result.validators
}

export const getLatestNodeOperatorSubgraphResult = async () => {
  // const result =  await client.query({ query : GET_ALL_ROLLUPS })
  const result: nodeOperatorData = await request(
    API_ENDPOINTS.SUBGRAPH,
    GET_ALL_NODE_OPERATORS
  )
  // return result.data.validators
  return result.nodeOperator
}

export function hashData(data: any): string {
  const hash = createHash("sha256")
  hash.update(JSON.stringify(data))
  return hash.digest("hex")
}

export { calculateScore, arraysEqual, getLatestValidatorSubgraphResult }
