import {  POST_VALIDATORS} from "./database";
import { getLatestValidatorSubgraphResult } from ".";
import { hashValidatorSubgraphResult } from ".";
var cron = require('node-cron');



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
let previousHash: string | null = null;
cron.schedule('*/30 * * * *', async () => {
  try {
    const validatorSubgraphResult = await getLatestValidatorSubgraphResult();

    if (validatorSubgraphResult && validatorSubgraphResult.length > 0) {
      const currentHash = hashValidatorSubgraphResult(validatorSubgraphResult);

      if (currentHash !== previousHash) {
        await POST_VALIDATORS({validatorSubgraphResult})
        previousHash = currentHash;
      } else {
        console.log("No new validators found in the subgraph query result.");
      }
    } else {
      console.error("No validators found in the subgraph query result.");
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  
  }
});

