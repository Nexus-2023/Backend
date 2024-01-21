import {
  POST_VALIDATORS,
  FETCH_AND_UPDATE_VALIDATORS,
  FETCH_AND_INSERT_BLOCK,
  POST_NODEOPERATORS,
  GET_VALIDATORS,
  GET_BLOCKS,
} from "./database"
import {
  getLatestValidatorSubgraphResult,
  getLatestNodeOperatorSubgraphResult,
  hashData,
} from "."

import { ENV } from "./constants"
const TelegramBot = require("node-telegram-bot-api")

var cron = require("node-cron")

/* @Developer
    This cron job is scheduled to run every 30 minutes using node-cron.

    The purpose of this job is to periodically fetch data from the subgraph, hash the data, and compare the hash with the previous hash.
    If the hashes differ, it indicates new changes in the subgraph data, and the POST_VALIDATORS function is called.

    The process involves the following steps:
    1. Fetch the latest validator data from the subgraph using getLatestValidatorSubgraphResult().
    2. Check if the fetched data is not null and has a length greater than 0.
    3. Hash the fetched data using SHA-256 for comparison.
    4. Compare the current hash with the previous hash.
    5. If the hashes differ, call POST_VALIDATORS() and update the previous hash.
    6. If the hashes are the same, log that no new validators were found.
*/
let previousHash: string | null = null
const job1 = cron.schedule("*/30 * * * *", async () => {
  try {
    const validatorSubgraphResult = await getLatestValidatorSubgraphResult()

    if (validatorSubgraphResult && validatorSubgraphResult.length > 0) {
      const currentHash = hashData(validatorSubgraphResult)

      if (currentHash !== previousHash) {
        await POST_VALIDATORS({ validatorSubgraphResult })
        previousHash = currentHash
      } else {
        console.log("No new validators found in the subgraph query result.")
      }
    } else {
      console.error("No validators found in the subgraph query result.")
    }
  } catch (error) {
    console.error("Error in cron job1:", error)
  }
})

/* @Developer
   This cron job is set to run every 30 minutes, calling the FETCH_AND_UPDATE_VALIDATORS function.
   It ensures that the information about validators is regularly updated from the external API. 
*/
const job2 = cron.schedule("*/30 * * * *", async () => {
  try {
    await FETCH_AND_UPDATE_VALIDATORS()
  } catch (error) {
    console.error("Error in cron job2:", error)
  }
})

/* @Developer
   This cron job is set to run every 12 sec, calling the FETCH_AND_INSERT_BLOCK() function.   
   It fetches block data and if the proposer is one of our validator then insert the block data
*/

const job3 = cron.schedule("*/12 * * * * *", async () => {
  try {
    await FETCH_AND_INSERT_BLOCK()
  } catch (error) {
    console.error("Error in cron job3:", error)
  }
})

/* @Developer
    This cron job is scheduled to run every 30 minutes using node-cron.

    The purpose of this job is to periodically fetch data from the subgraph, hash the data, and compare the hash with the previous hash.
    If the hashes differ, it indicates new changes in the subgraph data, and the POST_NODEOPERATORS function is called.

    The process involves the following steps:
    1. Fetch the latest nodeOpertator data from the subgraph using getLatestnodeOpertatorSubgraphResult().
    2. Check if the fetched data is not null and has a length greater than 0.
    3. Hash the fetched data using SHA-256 for comparison.
    4. Compare the current hash with the previous hash.
    5. If the hashes differ, call POST_NODEOPERATORS() and update the previous hash.
    6. If the hashes are the same, log that no new nodeOpertators were found.
*/

let previousHash2: string | null = null
const job4 = cron.schedule("*/30 * * * *", async () => {
  try {
    const nodeSubgraphResult: any = await getLatestNodeOperatorSubgraphResult()

    if (nodeSubgraphResult && nodeSubgraphResult.length > 0) {
      const currentHash = hashData(nodeSubgraphResult)

      if (currentHash !== previousHash2) {
        await POST_NODEOPERATORS(nodeSubgraphResult)
        previousHash = currentHash
      } else {
        console.log("No new node operators found in the subgraph query result.")
      }
    } else {
      console.error("No node operators found in the subgraph query result.")
    }
  } catch (error) {
    console.error("Error in cron job4:", error)
  }
})

/*
  @Developer
  Function: telegramBotAlert

  Description:
  This function sets up a Telegram bot using the provided token and continuously polls for alerts
  related to validators. It checks the status of each validator and sends an alert if a validator is slashed
  or has a balance less than 32 ETH. The alerts are sent to a specific chat ID.
 
  Cron Job:
  This function is scheduled to run every 30 minutes using a cron job (job5). 

*/

export async function telegramBotAlert() {
  const token = ENV.TELEGRAM_BOT_TOKEN

  const bot = new TelegramBot(token, { polling: true })

  const chatId = "Nexus_Alerts"

  const sendAlert = (message: string) => {
    bot.sendMessage(chatId, message)
  }

  try {
    const validators = await GET_VALIDATORS()

    for (const validator of validators) {
      if (validator.status === "slashed") {
        sendAlert(`Alert! Validator ${validator.index} is slashed.`)
      } else if (validator.balance < 32) {
        sendAlert(
          `Alert! Validator ${validator.index} has a balance less than 32 ETH.`
        )
      }
    }
  } catch (error) {
    console.error("Error in cron job3:", error)
  }
}

const job5 = cron.schedule("*/30 * * * *", async () => {
  await telegramBotAlert()
})

job1.start()
job2.start()
job3.start()
job4.start()
job5.start()
