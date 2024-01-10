import { Validator , Block } from "../types"
import { Hono } from "hono"
 
import { API_ENDPOINTS , ENV} from "./constants";
 

 
async function getValidators() {

  try {
    const validatorsData = await fetch( API_ENDPOINTS.VALIDATOR_ROUTE,  {
      method: "GET",
      cache: "no-store",
 
    }); 
    const result = await validatorsData.json()
       
    return result
  } catch (error) {
    console.error('Error fetching validators:', error);
    return new Response(JSON.stringify({ message: 'Error retrieving validators' }), { status: 500 });
  }
}

async function postValidator({ validator } :  {validator :  Validator} ) {
  try {
    const response = await fetch( API_ENDPOINTS.VALIDATOR_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ validator }),
    })

    if (!response.ok) {
      throw new Error("Failed to create validator.")
    }

    const data = await response.json()
    

    return data
  } catch (error) {
    console.error("Error creating validator:", error)
  }
}

async function updateValidator({ validator } :  {validator :  Validator}) {
  try {
    const response = await fetch(
      API_ENDPOINTS.VALIDATOR_UPDATE_ROUTE,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ validator }),
      }
    )

    if (!response.ok) {
      throw new Error("Failed to create validator.")
    }

    const data = await response.json()
    // console.log(data.result)

    return data
  } catch (error) {
    console.error("Error creating validator:", error)
  }
}

async function getNodeOperators() {
  try {
    const response = await fetch( API_ENDPOINTS.NODEOPERATOR_ROUTE, {
      method: "GET",
      cache: "no-store",
    })

    const result = await response.json()

    return result
  } catch (e) {
    console.log("response error ", e)
  }
}

async function getBlocks() {
  try {
    const response = await fetch( API_ENDPOINTS.BLOCK_ROUTE, {
      method: "GET",
      cache: "no-store",
    })

    const result = await response.json()

    return result
  } catch (e) {
    console.log("response error ", e)
  }
}

async function postBlocks({ block } : { block :Block}) {
  try {
    const response = await fetch( API_ENDPOINTS.BLOCK_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ block }),
    })

    if (!response.ok) {
      throw new Error("Failed to create block.")
    }

    const data = await response.json()
    // console.log(data.result)

    return data
  } catch (error) {
    console.error("Error creating block:", error)
  }
}

async function updateBlock({ updatedBlock } : { updatedBlock:Block}) {
  try {
    const response = await fetch( API_ENDPOINTS.BLOCK_UPDATE_ROUTE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updatedBlock }),
    })

    if (!response.ok) {
      throw new Error("Failed to update block.")
    }

    const data = await response.json()
    // console.log(data.result)

    return data
  } catch (error) {
    console.error("Error updating block:", error)
  }
}


export {
  
  getValidators,
  updateBlock,
  updateValidator,
  postValidator,
  postBlocks ,
  getBlocks,
  getNodeOperators
}
