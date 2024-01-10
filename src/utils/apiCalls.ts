import { Validator } from "../types"
import { Hono } from "hono"
import * as dotenv from 'dotenv';
dotenv.config();

const port = parseInt(process.env.SERVER_PORT as string, 10) || 3030

async function getValidators() {

  try {
    const validatorsData = await fetch(`http://localhost:${port}/route/validators`,  {
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

async function postValidator({ validator } : any) {
  try {
    const response = await fetch(`http://localhost:${port}/route/validators`, {
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




export {

  getValidators,
  postValidator
}
