

import { getValidators , postValidator , updateBlock, updateValidator ,getBlocks , getNodeOperators , postBlocks} from "./apiCalls"
 
import { API_ENDPOINTS ,ENV } from "./constants"
import { Validator, validatorSubgraphResult , Block} from "../types"

import { getLatestValidatorSubgraphResult , arraysEqual , calculateScore} from "."

async function validatorInsert({ subgraphResult } : { subgraphResult : validatorSubgraphResult }) {

    // Check if there are validators in the subgraph result
    if (subgraphResult.data.validators.length > 0) {
      // Fetch existing validators from the database
      const existingValidatorsResult = await getValidators()
      const existingValidators = existingValidatorsResult.data
  
      for (const subgraphValidator of subgraphResult.data.validators) {
        const publicKey = subgraphValidator.id
  
        // Check if the public key already exists in the database
        const keyExists = existingValidators.some( (validator : Validator) => validator.public_key === publicKey )
  
        // insert only those validators that does'nt exists in the database and validator is activated
        if (!keyExists && subgraphValidator.status === "ValidatorActivated") {
          const apiUrl =  API_ENDPOINTS.BEACON_VALIDATOR(publicKey)
  
          try {
            // Make a GET request to the external API
            const externalApiResult = await fetch(apiUrl, {
              method: "GET",
            })
  
            if (!externalApiResult.ok) {
              throw new Error(
                `Failed to fetch validator data. Status: ${externalApiResult.status}`
              )
            }
  
            const externalApiData = await externalApiResult.json()
  
       
  
            const externalValidators = externalApiData.data
  
            for (const externalValidator of externalValidators) {
              // console.log(
              //   "validator insert externalValidator ",
              //   externalValidator
              // )
  
              // Set the validator data
              const validator : Validator = {
                public_key: externalValidator.validator.pubkey,
                validator_index: externalValidator.index,
                cluster_id: subgraphValidator.clusterId,
                balance: externalValidator.balance,
                status: subgraphValidator.status,
                score: calculateScore(
                  externalValidator.balance,
                  externalValidator.validator.slashed
                ),
                rollupname: subgraphValidator.rollup,
              }
  
              // Post the validator data to the database
              const validatorResult = await postValidator({ validator }  )
              // console.log(validatorResult)
            }
          } catch (error) {
            console.error("Error fetching or posting validator data:", error)
          }
        } else {
          console.log(
            `Validator with public key ${publicKey} already exists. or validator is not activated`
          )
        }
      }
    } else {
      console.error("No validators found in the subgraph query result.")
    }
  }
  

  async function validatorUpdate() {
    // Fetch existing validators from the database
    const existingValidatorsResult = await getValidators()
  
    const existingValidators = existingValidatorsResult.data
  
    // console.log("existingValidators", existingValidators)
    for (const existingValidator of existingValidators) {
      // console.log("existingValidator", existingValidator)
      const publicKey = existingValidator.public_key
    
      const apiUrl =  API_ENDPOINTS.BEACON_VALIDATOR(publicKey)
  
      try {
       
        const externalApiResult = await fetch(apiUrl, {
          method: "GET",
        })
  
        if (!externalApiResult.ok) {
          throw new Error(
            `Failed to fetch validator data. Status: ${externalApiResult.status}`
          )
        }
  
        const externalApiData = await externalApiResult.json()
  
        const externalValidator = externalApiData.data
  
        // console.log("validator update externalValidator ", externalValidator)
        // console.log(
        //   "externalValidator.validator ",
        //   externalValidator[0].validator
        // )
        // Set the validator data
        const validator:any = {
          public_key: externalValidator[0].validator.pubkey,
          balance: externalValidator[0].balance,
          status: externalValidator[0].status,
          score: calculateScore(
            externalValidator[0].balance,
            externalValidator[0].validator.slashed
          ),
        }
  
        // Post the validator data to the database
        const validatorResult = await updateValidator({ validator })
        // console.log(validatorResult)
      } catch (error) {
        console.error("Error updating validator data:", error)
      }
    }
  }
  

 
  async function BlockInsert() {

    const apiUrl = API_ENDPOINTS.BEACON_BLOCKS
  

  
    try {
      //fetch updated data
      const externalApiResult = await fetch(apiUrl, {
        method: "GET",
      })
  
      if (!externalApiResult.ok) {
        throw new Error(
          `Failed to fetch blocks data. Status: ${externalApiResult.status}`
        )
      }
  
      const externalApiData = await externalApiResult.json()
  
      const blocksData = externalApiData.data
      // console.log("blocksData", blocksData)
  
      const blockProposer = blocksData.message.proposer_index
  
      const existingValidatorsResult = await getValidators()
      const existingValidators = existingValidatorsResult.data
  
      // console.log("existingValidators", existingValidators)
  


      // query from databse instead of using for loop
  
      for (const existingValidator of existingValidators) {
        // console.log(
        //   "existingValidator.validator_index",
        //   existingValidator.validator_index
        // )
        // console.log("validator index", blocksData.message.proposer_index)
        if (blockProposer === existingValidator.validator_index) {
          //insert block data in the blocks table
  
          const block = {
            block_number: blocksData.message.body.execution_payload.block_number,
            block_proposer: blocksData.message.proposer_index,
            slot: blocksData.message.slot,
            root: "",
            parent_root: blocksData.message.parent_root,
  
            validator_exit: blocksData.message.body.deposits.voluntary_exits, // [] extract further
            withdrawals: blocksData.message.body.execution_payload.withdrawals, // [] extract further
            proposer_slashings: blocksData.message.body.proposer_slashings, // []
            finalized: externalApiData.finalized,
            // attester_slashings: blocksData.message.body.attester_slashings, // []
  
            // deposits: blocksData.message.body.deposits, //[]
            // voluntary_exits: blocksData.message.body.deposits.voluntary_exits, // []
          }
  
         
  
          const blockResult = await postBlocks({ block })
  
          break
        }
      }
  
      // console.log(validatorResult)
    } catch (error) {
      console.error("Error in blockinsert() ", error)
    }
  }
  
  async function BlockUpdate({ block } : {block: Block}) {
    const block_parent_root:any = block.parent_root

 
    const apiUrl = API_ENDPOINTS.BEACON_HEADERS(block_parent_root)
    
 
  
    try {
      //fetch updated data
      const externalApiResult = await fetch(apiUrl, {
        method: "GET",
      })
  
      if (!externalApiResult.ok) {
        throw new Error(
          `Failed to fetch blocks data. Status: ${externalApiResult.status}`
        )
      }
  
      const externalApiData = await externalApiResult.json()
  
      const blocksData = externalApiData.data[0]
  
      if (
        block.slot == blocksData.header.message.slot &&
        block.block_proposer == blocksData.header.message.proposer_index
      ) {
        //insert block data in the blocks table
  
        if (externalApiData.finalized === true) {
          const updatedBlock:any = {
            block_number: block.block_number,
            block_proposer: block.block_proposer,
            root: blocksData.root,
            finalized: externalApiData.finalized,
          }
  
          // update block data
  
          const blockResult = await updateBlock({ updatedBlock })
        } else {
          console.log("finalized is false")
        }
      } else {
        console.log("incorrect slot or validator index")
        return
      }
    } catch (error) {
      console.error("Error in blockUpdate() ", error)
    }
  }
  
 
  
//   async function checkForValidatorSubgraphUpdates() {
//     // const client = useApollo();
  
//     // Initial subgraph result
//     let previousSubgraphResult = await getLatestValidatorSubgraphResult()
  
//     // Polling interval in milliseconds (e.g., every 1 min)
//     const pollingInterval = 60000
  
//     // Function to monitor for updates
//     const monitorForUpdates = async () => {
//       try {
//         // Get the latest subgraph result
//         const currentSubgraphResult = await getLatestValidatorSubgraphResult()
  
//         // Compare the current result with the previous result
//         if (!arraysEqual(previousSubgraphResult, currentSubgraphResult)) {
//           console.log(
//             "Subgraph data has been updated. Triggering validator insert function."
//           )
  
//           // Trigger the validator insert function with the latest subgraph result
//           const response = await validatorInsert({
//             subgraphResult: currentSubgraphResult,
//           })
  
//           // Update the previous result for the next comparison
//           previousSubgraphResult = currentSubgraphResult
  
//           console.log("Validator insert function response:", response)
//         }
//       } catch (error) {
//         console.error("Error monitoring for updates:", error)
//       }
  
//       // Schedule the next check
//       setTimeout(monitorForUpdates, pollingInterval)
//     }
  
//     // Start monitoring for updates
//     monitorForUpdates()
//   }
  