




// async function validatorInsert({ subgraphResult }) {
//     // Check if there are validators in the subgraph result
//     if (subgraphResult.data.validators.length > 0) {
//       // Fetch existing validators from the database
//       const existingValidatorsResult = await getValidators()
//       const existingValidators = existingValidatorsResult.data
  
//       for (const subgraphValidator of subgraphResult.data.validators) {
//         const publicKey = subgraphValidator.id
  
//         // Check if the public key already exists in the database
//         const keyExists = existingValidators.some(
//           validator => validator.public_key === publicKey
//         )
  
//         // insert only those validators that does'nt exists in the database
//         if (!keyExists) {
//           const apiUrl = `http://47.128.81.7:3500/eth/v1/beacon/states/head/validators?id=${publicKey}`
  
//           try {
//             // Make a GET request to the external API
//             const externalApiResult = await fetch(apiUrl, {
//               method: "GET",
//             })
  
//             if (!externalApiResult.ok) {
//               throw new Error(
//                 `Failed to fetch validator data. Status: ${externalApiResult.status}`
//               )
//             }
  
//             const externalApiData = await externalApiResult.json()
  
//             // Assuming the externalApiData structure, adjust accordingly based on the actual structure
  
//             const externalValidators = externalApiData.data
  
//             for (const externalValidator of externalValidators) {
//               // console.log(
//               //   "validator insert externalValidator ",
//               //   externalValidator
//               // )
  
//               // Set the validator data
//               const validator = {
//                 public_key: externalValidator.validator.pubkey,
//                 validator_index: externalValidator.index,
//                 cluster_id: subgraphValidator.clusterId,
//                 balance: externalValidator.balance,
//                 status: subgraphValidator.status,
//                 score: calculateScore(
//                   externalValidator.balance,
//                   externalValidator.validator.slashed
//                 ),
//                 rollupname: subgraphValidator.rollup,
//               }
  
//               // Post the validator data to the database
//               const validatorResult = await postValidator({ validator })
//               // console.log(validatorResult)
//             }
//           } catch (error) {
//             console.error("Error fetching or posting validator data:", error)
//           }
//         } else {
//           console.log(
//             `Validator with public key ${publicKey} already exists. Skipping.`
//           )
//         }
//       }
//     } else {
//       console.error("No validators found in the subgraph query result.")
//     }
//   }
  