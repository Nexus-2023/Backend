import { serve } from "@hono/node-server"

import * as dotenv from "dotenv"
import { prettyJSON } from "hono/pretty-json"

import { logger } from "hono/logger"

import { Hono } from "hono"

import { API_ENDPOINTS, ENV } from "./utils/constants"

dotenv.config()

const app = new Hono()
app.use("*", prettyJSON({ space: 4 }))
app.use("*", logger())
app.notFound(c => c.json({ message: "Not Found", ok: false }, 404))

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
