import validatorRouter from './routes/validator'
import BlockRouter from './routes/Block';
import nodeOperatorRouter from './routes/nodeOperator';
import { serve } from '@hono/node-server'
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { prettyJSON } from 'hono/pretty-json'
 
import { logger } from 'hono/logger'
import { getValidators , postValidator , getBlocks , getNodeOperators} from './utils/apiCalls';
import { Hono } from 'hono'
import { request, gql } from 'graphql-request'
import { API_ENDPOINTS , ENV } from './utils/constants';
import { GET_ALL_VALIDATORS } from './subGraphQueries';
import { getLatestValidatorSubgraphResult } from './utils';
dotenv.config();
const app = new Hono()
app.use('*', prettyJSON({ space: 4 }) )
app.use('*', logger())
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))
  
 
// fetching graphql data thorugh graphql-request
app.get('/graphql', async (c) => { 
  // const result = await request(API_ENDPOINTS.SUBGRAPH, GET_ALL_VALIDATORS)  
  const result = await getLatestValidatorSubgraphResult()
  return c.json(result)  
})


app.get('/', async (c) => { 
  const validator = await getValidators()    
  const blocks = await getBlocks()
  const nodeOperator = await getNodeOperators()

  const responseData= {
    validators: validator.data,
    blocks: blocks.data,
    nodeOperators: nodeOperator.data,
  };
 
  return c.json(responseData)  
})


 
 
 

 
 
console.log(`Server is running on port ${ENV.SERVER_PORT}`)

 
app.route('/route', validatorRouter)

app.route('/route', BlockRouter)
app.route('/route', nodeOperatorRouter)

 

 
serve({
  fetch: app.fetch,
  port : ENV.SERVER_PORT
})


 export default app