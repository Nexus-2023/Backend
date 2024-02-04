import {
  Validator,
  validatorSubgraphResult,
  Block,
  DatabaseConfig,
  nodeOperator,
  ValidatorData,
  subgraphValidator,
} from "../types"

import { arraysEqual, calculateScore } from "../utils"

import { queryManager } from "./query"

export class DatabaseIU {
  private _QueryManager: queryManager

  constructor(QueryManager: queryManager) {
    this._QueryManager = QueryManager
  }

  async POST_VALIDATORS({
    subgraphValidator,
    res,
  }: {
    subgraphValidator: subgraphValidator
    res: any
  }) {
    try {
      const validatorResult = res.data

      const validator: Validator = {
        public_key: validatorResult.validator.pubkey,
        validator_index: validatorResult.index,
        cluster_id: subgraphValidator.clusterId,
        balance: validatorResult.balance,
        status: subgraphValidator.status,
        score: calculateScore(
          validatorResult.balance,
          validatorResult.validator.slashed
        ),
        rollupname: subgraphValidator.rollup,
      }

      await this._QueryManager.INSERT_VALIDATOR({ validator })
    } catch (error) {
      console.error("Error fetching or posting validator data:", error)
    }
  }

  async POST_BLOCK(res: any) {
    try {
      const blocksData = res.data

      // console.log("blocksData", blocksData)

      const blockProposer = blocksData.message.proposer_index

      const proposedValidator = await this._QueryManager.GET_VALIDATOR_BY_INDEX(
        blockProposer
      )
      if (proposedValidator && proposedValidator.length > 0) {
        console.log(
          "Block proposer is from one of our validators:",
          proposedValidator[0].public_key
        )
        if (blockProposer === proposedValidator[0].validator_index) {
          const Block = {
            block_number:
              blocksData.message.body.execution_payload.block_number,
            block_proposer: blocksData.message.proposer_index,
            slot: blocksData.message.slot,
            validator_exit: blocksData.message.body.deposits.voluntary_exits, // [] extract further
            withdrawals: blocksData.message.body.execution_payload.withdrawals, // [] extract further
            proposer_slashings: blocksData.message.body.proposer_slashings, // []
            finalized: blocksData.finalized,
          }

          await this._QueryManager.INSERT_BLOCK({ Block })

          console.log("POST_BLOCK successfull ")

          return
        } else {
          console.log("Error blockproposer does not match validator index")
          return
        }
      } else {
        console.log("Block proposer is not from one of our validators.")
      }
    } catch (error) {
      console.error("Error in blockinsert() ", error)
    }
  }

  async POST_NODEOPERATORS({
    nodeOperatorSubgraphResult,
  }: {
    nodeOperatorSubgraphResult: any
  }) {
    const existingnodeOperators = await this._QueryManager.GET_NODEOPERATORS()

    for (const subgraphnodeOperator of nodeOperatorSubgraphResult) {
      const publicKey = subgraphnodeOperator.id

      const keyExists = existingnodeOperators.some(
        (nodeOperator: nodeOperator) => nodeOperator.public_key === publicKey
      )

      if (!keyExists) {
        try {
          const nodeOperator: nodeOperator = {
            public_key: nodeOperatorSubgraphResult.public_key,
            name: nodeOperatorSubgraphResult.name,
            validator_count: nodeOperatorSubgraphResult.validator_count,

            score: 99,
            node_operator_id: nodeOperatorSubgraphResult.node_operator_id,
            cluster_id: nodeOperatorSubgraphResult.cluster_id,
          }

          await this._QueryManager.INSERT_NODEOPERATORS({ nodeOperator })
        } catch (error) {
          console.error("Error posting node operator data:", error)
        }
      } else {
        console.log(`nodeOperator with public key ${publicKey} already exists.`)
      }
    }
  }

  async POST_UPDATE_VALIDATORS(res: any) {
    const cond = res.data && res.data.length > 0

    if (cond) {
      const validatorResult = res.data

      const validator: any = {
        public_key: validatorResult[0].validator.pubkey,
        balance: validatorResult[0].balance,
        status: validatorResult[0].status,
        score: calculateScore(
          validatorResult[0].balance,
          validatorResult[0].validator.slashed
        ),
      }
      await this._QueryManager.UPDATE_VALIDATOR({ validator })
    } else {
      console.log("public key is invalid , could not fetch from consensus api")
    }
  }
}
