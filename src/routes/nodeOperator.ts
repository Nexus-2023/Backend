import { Hono } from "hono";
import { Pool , QueryResult} from "pg"
import { DatabaseConfig, Validator , ValidatorsResponse } from "../types";
import * as dotenv from 'dotenv';
import { API_ENDPOINTS , ENV } from "../utils/constants";
dotenv.config();
const nodeOperatorRouter = new Hono()


const dbConfig: DatabaseConfig = {
    host:  ENV.DB_HOST  ,
    port:  ENV.DB_PORT  ,
    database:  ENV.DB_DATABASENAME  ,
    user:  ENV.DB_USERNAME  ,
    password:  ENV.DB_PASSWORD  ,
  };

  
  const pool = new Pool(dbConfig);
console.log('Database connection pool created:', dbConfig);




nodeOperatorRouter.get('/nodeOperators', async (c) => {
    const client = await pool.connect();
  try {
    console.log('Connected to database:', dbConfig);

    const result = await client.query('SELECT * FROM NODEOPERATORS;');


    return c.json(({ data: result.rows }),   200 );
  } catch (error) {
    console.error('Error fetching nodeOperator Data:', error);
    return c.json(
      JSON.stringify({ message: 'Internal Error retrieving  nodeOperator Data' }),
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


   
  
 
 

export default nodeOperatorRouter  


