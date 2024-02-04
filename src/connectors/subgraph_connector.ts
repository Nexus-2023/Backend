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

export class GraphQLDataManager {
  constructor() {}

  public async getLatestValidatorSubgraphResult(): Promise<any[]> {
    const result: ValidatorData = await request(
      API_ENDPOINTS.SUBGRAPH,
      GET_ALL_VALIDATORS
    )
    return result.validators
  }

  public async getLatestNodeOperatorSubgraphResult(): Promise<any[]> {
    const result: nodeOperatorData = await request(
      API_ENDPOINTS.SUBGRAPH,
      GET_ALL_NODE_OPERATORS
    )
    return result.nodeOperator
  }
}
