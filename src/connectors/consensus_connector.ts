import { API_ENDPOINTS, ENV } from "../utils/constants"
import { subgraphValidator, validatorSubgraphResult, Validator } from "../types"

import { GET_VALIDATORS, GET_VALIDATOR_BY_INDEX } from "../database/query"
import { calculateScore } from "../utils"
import {
  POST_VALIDATORS,
  POST_BLOCK,
  POST_UPDATE_VALIDATORS,
} from "../database/insert_update"

export async function consensusDataApi(apiUrl: string): Promise<any> {
  try {
    const ApiResult = await fetch(apiUrl, {
      method: "GET",
    })

    if (!ApiResult.ok) {
      throw new Error(`Failed to fetch data. Status: ${ApiResult.status}`)
    }

    return await ApiResult.json()
  } catch (error) {
    console.error("Error fetching  API data:", error)
    throw error
  }
}

// TODO return type
export async function FETCH_CONSENSUS_BLOCK() {
  try {
    const apiurl = API_ENDPOINTS.BEACON_BLOCKS
    return await consensusDataApi(apiurl)
  } catch (e) {
    console.log("error in fetch_consensus_block function", e)
    throw e
  }
}

// TODO return type
export async function FETCH_CONSENSUS_VALIDATOR(pubkey: string) {
  try {
    const apiurl = API_ENDPOINTS.BEACON_VALIDATOR(pubkey)
    return await consensusDataApi(apiurl)
  } catch (e) {
    console.log("error in fetch_consensus_VALIDATOR function", e)
    throw e
  }
}

export async function FETCH_AND_POST_VALIDATORS({
  validatorSubgraphResult,
}: {
  validatorSubgraphResult: subgraphValidator[]
}) {
  const existingValidators = await GET_VALIDATORS()

  for (const subgraphValidator of validatorSubgraphResult) {
    const publicKey = subgraphValidator.id

    const keyExists = existingValidators.some(
      (validator: Validator) => validator.public_key === publicKey
    )

    if (!keyExists && subgraphValidator.status === "ValidatorActivated") {
      try {
        const res = await FETCH_CONSENSUS_VALIDATOR(publicKey)

        await POST_VALIDATORS({ res, subgraphValidator })
      } catch (error) {
        console.error("Error fetching or posting validator data:", error)
      }
    } else {
      console.log(
        `Validator with public key ${publicKey} already exists. or validator is not activated`
      )
    }
  }
}

export async function FETCH_AND_POST_BLOCK() {
  const res = FETCH_CONSENSUS_BLOCK()
  await POST_BLOCK(res)
}

export async function FETCH_AND_UPDATE_VALIDATORS() {
  const existingValidators = await GET_VALIDATORS()

  for (const existingValidator of existingValidators) {
    const publicKey = existingValidator.public_key

    try {
      const res = await FETCH_CONSENSUS_VALIDATOR(publicKey)

      await POST_UPDATE_VALIDATORS({ res })
    } catch (error) {
      console.error("Error updating validator data:", error)
    }
  }
}
