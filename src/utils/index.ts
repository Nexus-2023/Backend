// import {
//     GET_ALL_DATA,
//     GET_ALL_ROLLUP,
//     GET_ALL_CLUSTERS,
//     GET_ALL_NODE_OPERATORS,
//     GET_ALL_VALIDATORS,
//   } from "@/subGraphQueries"
//   import { getClient } from "@/lib/client"
//   function calculateScore(balance, slashed) {
//     const threshold = 32000000000
  
//     if (balance > threshold) {
//       return slashed ? 80 : 99
//     } else {
//       return 50
//     }
//   }
  
//   // Function to compare two arrays for equality
//   function arraysEqual(array1, array2) {
//     return JSON.stringify(array1) === JSON.stringify(array2)
//   }
  
//   const getLatestValidatorSubgraphResult = async () => {
//     const result = await getClient.query({
//       GET_ALL_VALIDATORS,
//     })
//     return result.data.validators
//   }
  
//   export { calculateScore, arraysEqual, getLatestValidatorSubgraphResult }
  