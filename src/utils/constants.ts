import * as dotenv from "dotenv"
dotenv.config()

const ENV = {
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USERNAME: process.env.DB_USERNAME || "defaultUser",
  DB_PASSWORD: process.env.DB_PASSWORD || "defaultPass",
  DB_DATABASENAME: process.env.DB_DATABASENAME || "dbName",
  DB_SCHEMA: process.env.DB_SCHEMA || "schema",
  DB_PORT: parseInt(process.env.DB_PORT as string, 10) || 5432,
  SERVER_PORT: parseInt(process.env.SERVER_PORT as string, 10) || 4030,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "api token",
}

const API_ENDPOINTS = {
  SUBGRAPH: process.env.GRAPH_URI || "NULL",
  BACKEND_ENDPOINT: process.env.BACKEND_ENDPOINT || "NULL",
  BEACON_VALIDATOR: (publicKey: string) =>
    `${process.env.BEACON_IP}/eth/v1/beacon/states/head/validators?id=${publicKey}` ||
    "NULL",
  BEACON_BLOCKS:
    `${process.env.BEACON_IP}/eth/v2/beacon/blocks/finalized` || "NULL",
  BEACON_HEADERS: (block_parent_root: string) =>
    `${process.env.BEACON_IP}/eth/v1/beacon/headers?parent_root=${block_parent_root}` ||
    "NULL",
  BEACON_DETAILED_BLOCK: (root: string) =>
    `${process.env.BEACON_IP}/eth/v2/beacon/blocks${root}` || "NULL",
}

export { API_ENDPOINTS, ENV }
