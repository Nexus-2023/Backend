import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
} from "@apollo/client"
import * as dotenv from "dotenv"
import { API_ENDPOINTS } from "../utils/constants"
dotenv.config()

// fetching graphql data thorugh apolloClient
export const client = new ApolloClient({
  uri: API_ENDPOINTS.SUBGRAPH || "null",
  cache: new InMemoryCache(),
})
