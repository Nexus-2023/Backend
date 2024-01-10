import { Hono } from "hono";
import { Pool , QueryResult} from "pg"
import { DatabaseConfig, Validator , ValidatorsResponse } from "../types";
import * as dotenv from 'dotenv';
import { API_ENDPOINTS , ENV } from "../utils/constants";
dotenv.config();
const BlockRouter = new Hono()


const dbConfig: DatabaseConfig = {
    host:  ENV.DB_HOST  ,
    port:  ENV.DB_PORT  ,
    database:  ENV.DB_DATABASENAME  ,
    user:  ENV.DB_USERNAME  ,
    password:  ENV.DB_PASSWORD  ,
  };

  
  const pool = new Pool(dbConfig);
console.log('Database connection pool created:', dbConfig);




BlockRouter.get('/Blocks', async (c) => {
    const client = await pool.connect();
  try {
    console.log('Connected to database:', dbConfig);

    const result = await client.query('SELECT * FROM BLOCKS;');


    return c.json(({ data: result.rows }),   200 );
  } catch (error) {
    console.error('Error fetching Block Data:', error);
    return c.json(
      JSON.stringify({ message: 'Internal Error retrieving Block Data' }),
      { status: 500 }
    );
  }
  
  finally {
    if (client) {
     
      client.release();
      console.log('Database connection released');
    }
  }
 
  })


  BlockRouter.post('/Blocks', async (c ) => {
    const client = await pool.connect();
  try {
    console.log('Connected to database:', dbConfig);
    const Data  = await c.req.json()
    console.log("Data", Data)
 
    console.log("block/api/Data ", Data.block)
    const {
      block_number,
      block_proposer,
      slot,
      root,
      parent_root,

      validator_exit,
      withdrawals,
      proposer_slashings,

      finalized,
    } = Data.block

    const result = await pool.query(
      "INSERT INTO BLOCKS (block_number, block_proposer , slot, root, parent_root,validator_exit, withdrawals, proposer_slashings , finalized, last_update_time) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9  , CURRENT_TIMESTAMP) RETURNING *",
      [
        block_number,
        block_proposer,
        slot,
        root,
        parent_root,
        validator_exit,
        withdrawals,
        proposer_slashings,
        finalized,
      ]
    )

 

    return c.json(({ message : "Block data inserted successfully" }),   200 );
  } catch (error) {
    console.error('Error fetching data:', error);
    return c.json(
      JSON.stringify({ message: 'Failed to insert Block data' }),
      500 
    );
  }
  
  finally {
    if (client) {
     
      client.release();
      console.log('Database connection released');
    }
  }
 
  })


 

  BlockRouter.post('/BlockUpdate', async (c ) => {
    const client = await pool.connect();
  try {
    console.log('Connected to database:', dbConfig);
    const Data  = await c.req.json()
    console.log("Data", Data)
    const {
        block_number,
  
        root,
        finalized,
      } = Data.block
      const result = await pool.query(
        "UPDATE blocks SET root = $1, finalized = $2, last_update_time = NOW() WHERE block_number = $3 RETURNING *",
        [root, finalized , block_number]
      )

    return c.json(({ message : "Block Updated successfully" }),   200 );
  } catch (error) {
    console.error('Error fetching data:', error);
    return c.json(
      JSON.stringify({ message: 'Failed to Update Block data' }),
      500 
    );
  }
  
  finally {
    if (client) {
     
      client.release();
      console.log('Database connection released');
    }
  }
 
  })


export default BlockRouter  


