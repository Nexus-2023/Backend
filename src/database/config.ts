import { DatabaseConfig } from "../types"
import { ENV } from "../utils/constants"

const dbConfig: DatabaseConfig = {
  host: ENV.DB_HOST,
  port: ENV.DB_PORT,
  user: ENV.DB_USERNAME,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_DATABASENAME,
}

export default dbConfig
