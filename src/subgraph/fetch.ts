import { ValidatorData, nodeOperator, nodeOperatorData } from "../types"
import { API_ENDPOINTS } from "../utils/constants"

import {
  GET_ALL_VALIDATORS,
  GET_ALL_NODE_OPERATORS,
  GET_ALL_ROLLUPS,
} from "./queries"
import { request, gql } from "graphql-request"

export const getLatestValidatorSubgraphResult = async () => {
  // const result =  await client.query({ query : GET_ALL_ROLLUPS })
  const result: ValidatorData = await request(
    API_ENDPOINTS.SUBGRAPH,
    GET_ALL_VALIDATORS
  )
  return result.validators
}

export const getLatestNodeOperatorSubgraphResult = async () => {
  const result: nodeOperatorData = await request(
    API_ENDPOINTS.SUBGRAPH,
    GET_ALL_NODE_OPERATORS
  )

  return result.nodeOperator
}
