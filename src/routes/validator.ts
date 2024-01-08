import { Hono } from "hono";
import { Pool , QueryResult} from "pg"
import { DatabaseConfig, Validator , ValidatorsResponse } from "../types";
import * as dotenv from 'dotenv';
 
dotenv.config();
const validatorRouter = new Hono()

 
const dbConfig: DatabaseConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT as string, 10) || 5432,
    database: process.env.DB_DATABASENAME || "dbName",
    user: process.env.DB_USERNAME || "defaultUser",
    password: process.env.DB_PASSWORD || "defaultPass",
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


  validatorRouter.post('/validators', async (c , args) => {
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


// app.post('/', async (req) => {
//   const client = await pool.connect();
//   try {
//     console.log('Connected to database for POST request');

//     const data = await req.json();
//     const {
//       public_key,
//       validator_index,
//       cluster_id,
//       balance,
//       status,
//       score,
//       rollupname,
//     } = data.validator;

//     const result = await client.query(
//       'INSERT INTO VALIDATORS (public_key, validator_index, cluster_id, balance, status, last_update_time, score, rollupname) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7) RETURNING *',
//       [
//         public_key,
//         validator_index,
//         cluster_id,
//         balance,
//         status,
//         score,
//         rollupname,
//       ]
//     );

//     return new Response(
//       JSON.stringify({ data: result.rows, result: "Validator created successfully" }),
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error creating validator:', error);
//     return new Response(
//       JSON.stringify({ message: "Internal Validator failed to create" }),
//       { status: 500 }
//     );
//   } finally {
//     if (client) {
//       client.release();
//       console.log('Database connection released after POST request');
//     }
//   }
// });



export default validatorRouter  


