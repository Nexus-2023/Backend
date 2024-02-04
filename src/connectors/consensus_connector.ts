import { API_ENDPOINTS, ENV } from "../utils/constants"
import { subgraphValidator, validatorSubgraphResult, Validator } from "../types"

import { DatabaseIU } from "../database/insert_update"
import { queryManager } from "../database/query"

export class consensusConnector {
  private _DatabaseIU: DatabaseIU
  private _queryManager: queryManager

  constructor(DatabaseIU: DatabaseIU, queryManager: queryManager) {
    this._DatabaseIU = DatabaseIU
    this._queryManager = queryManager
  }

  private async consensusDataApi(apiUrl: string): Promise<any> {
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
  private async FETCH_CONSENSUS_BLOCK() {
    try {
      const apiurl = API_ENDPOINTS.BEACON_BLOCKS
      return await this.consensusDataApi(apiurl)
    } catch (e) {
      console.log("error in fetch_consensus_block ", e)
      throw e
    }
  }

  // TODO return type
  private async FETCH_CONSENSUS_VALIDATOR(pubkey: string) {
    try {
      const apiurl = API_ENDPOINTS.BEACON_VALIDATOR(pubkey)
      return await this.consensusDataApi(apiurl)
    } catch (e) {
      console.log("error in fetch_consensus_VALIDATOR ", e)
      throw e
    }
  }

  async FETCH_AND_POST_VALIDATORS({
    validatorSubgraphResult,
  }: {
    validatorSubgraphResult: subgraphValidator[]
  }) {
    const existingValidators = await this._queryManager.GET_VALIDATORS()

    for (const subgraphValidator of validatorSubgraphResult) {
      const publicKey = subgraphValidator.id

      const keyExists = existingValidators.some(
        (validator: Validator) => validator.public_key === publicKey
      )

      if (!keyExists && subgraphValidator.status === "ValidatorActivated") {
        try {
          const res = await this.FETCH_CONSENSUS_VALIDATOR(publicKey)

          await this._DatabaseIU.POST_VALIDATORS({ res, subgraphValidator })
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

  async FETCH_AND_POST_BLOCK() {
    const res = this.FETCH_CONSENSUS_BLOCK()
    await this._DatabaseIU.POST_BLOCK(res)
  }

  async FETCH_AND_UPDATE_VALIDATORS() {
    const existingValidators = await this._queryManager.GET_VALIDATORS()

    for (const existingValidator of existingValidators) {
      const publicKey = existingValidator.public_key

      try {
        const res = await this.FETCH_CONSENSUS_VALIDATOR(publicKey)

        await this._DatabaseIU.POST_UPDATE_VALIDATORS({ res })
      } catch (error) {
        console.error("Error updating validator data:", error)
      }
    }
  }
}
