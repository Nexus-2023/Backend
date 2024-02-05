import { ApolloClient, InMemoryCache } from "@apollo/client"
import { ValidatorData, nodeOperator, nodeOperatorData } from "../types"

import {
  GET_ALL_VALIDATORS,
  GET_ALL_NODE_OPERATORS,
  GET_ALL_ROLLUPS,
} from "../subgraph/queries"

import { request, gql } from "graphql-request"
import * as dotenv from "dotenv"
import { API_ENDPOINTS } from "../utils/constants"
dotenv.config()

// fetching graphql data thorugh apolloClient
export const client = new ApolloClient({
  uri: API_ENDPOINTS.SUBGRAPH || "null",
  cache: new InMemoryCache(),
})

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
