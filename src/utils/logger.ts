import pino from "pino"

import * as fs from "fs"

export class Logger {
  private readonly logger: pino.Logger

  constructor(logFileName: string) {
    const logStream = fs.createWriteStream(logFileName, { flags: "a" })

    this.logger = pino(
      {
        level: "info",
        base: null,
        transport: {
          targets: [
            {
              target: "pino-pretty",
            },
            {
              target: "pino/file",
              options: { destination: logFileName },
            },
          ],
        },
      },
      logStream
    )
  }

  info(message: string, data?: Record<string, any>): void {
    this.logger.info(message, data)
  }

  error(message: string, error?: Error): void {
    this.logger.error(message, error)
  }
  // Log a warning message
  warn(message: string, data?: Record<string, any>): void {
    this.logger.warn({ message, data })
  }

  // Log a debug message
  debug(message: string, data?: Record<string, any>): void {
    this.logger.debug({ message, data })
  }
}

/*

Example Usage
import { Logger } from "./utils/logger"

   const logFilePath = "src/Logs/All.log"
 

   const allLoger = new Logger(logFilePath)
   allLoger.info("This is an info message1.")
   allLoger.error("This is an error message1.", new Error("Sample error"))
 

*/
