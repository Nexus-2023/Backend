import { Hono } from "hono";
import { Pool , QueryResult} from "pg"
import { DatabaseConfig, Validator , ValidatorsResponse } from "../types";
import * as dotenv from 'dotenv';
import { API_ENDPOINTS , ENV } from "../utils/constants";
dotenv.config();
const validatorRouter = new Hono()


const dbConfig: DatabaseConfig = {
    host:  ENV.DB_HOST  ,
    port:  ENV.DB_PORT  ,
    database:  ENV.DB_DATABASENAME  ,
    user:  ENV.DB_USERNAME  ,
    password:  ENV.DB_PASSWORD  ,
  };

  
  const pool = new Pool(dbConfig);
console.log('Database connection pool created:', dbConfig);




validatorRouter.get('/validators', async (c) => {
    const client = await pool.connect();
  try {
    console.log('Connected to database:', dbConfig);

    const result = await client.query('SELECT * FROM VALIDATORS;');


    return c.json(({ data: result.rows }),   200 );
  } catch (error) {
    console.error('Error fetching data:', error);
    return c.json(
      JSON.stringify({ message: 'Internal Error retrieving chats' }),
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


  validatorRouter.post('/validators', async (c ) => {
    const client = await pool.connect();
  try {
    console.log('Connected to database:', dbConfig);
    const Data  = await c.req.json()
    console.log("Data", Data)
    const {
        public_key,
        validator_index,
        cluster_id,
        balance,
        status,
        score,
        rollupname,
      } = Data.validator
 
      const result = await client.query(
        "INSERT INTO VALIDATORS (public_key, validator_index, cluster_id, balance, status, last_update_time, score, rollupname) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7) RETURNING *",
        [
          public_key,
          validator_index,
          cluster_id,
          balance,
          status,
          score,
          rollupname,
        ]
      )

    return c.json(({ message : "Validator data inserted successfully" }),   200 );
  } catch (error) {
    console.error('Error fetching data:', error);
    return c.json(
      JSON.stringify({ message: 'Failed to insert validator data' }),
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


 

  validatorRouter.post('/validatorUpdate', async (c ) => {
    const client = await pool.connect();
  try {
    console.log('Connected to database:', dbConfig);
    const Data  = await c.req.json()
    console.log("Data", Data)
    const { public_key, balance, status, score } = Data.validator
 
      const result = await pool.query(
        "UPDATE validators SET balance = $1, status = $2, score = $3 , last_update_time = NOW() WHERE public_key = $4 RETURNING *",
        [balance, status, score, public_key]
      )

    return c.json(({ message : "Validator Updated successfully" }),   200 );
  } catch (error) {
    console.error('Error fetching data:', error);
    return c.json(
      JSON.stringify({ message: 'Failed to Update validator data' }),
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


export default validatorRouter  


