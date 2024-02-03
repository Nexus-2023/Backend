import { serve } from "@hono/node-server"

import * as dotenv from "dotenv"
import { prettyJSON } from "hono/pretty-json"

import { logger } from "hono/logger"

import { Hono } from "hono"
import { request, gql } from "graphql-request"
import { API_ENDPOINTS, ENV } from "./utils/constants"
import { GET_VALIDATORS } from "./database/query"
import { getLatestValidatorSubgraphResult } from "./connectors/subgraph_connector"
import { databaseSetup } from "./database/setup"

dotenv.config()

const app = new Hono()
app.use("*", prettyJSON({ space: 4 }))
app.use("*", logger())
app.notFound(c => c.json({ message: "Not Found", ok: false }, 404))

app.get("/graphql", async c => {
  const result = await getLatestValidatorSubgraphResult()
  return c.json(result)
})

/*
Write routes for frontEnd to call
*/

app.get("/", async c => {
  return c.text("setting up database")
})

console.log(`Server is running on port ${ENV.SERVER_PORT}`)

serve({
  fetch: app.fetch,
  port: ENV.SERVER_PORT,
})

export default app
