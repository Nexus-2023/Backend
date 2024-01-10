import validatorRouter from './routes/validator'
import { serve } from '@hono/node-server'
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { prettyJSON } from 'hono/pretty-json'
 
import { logger } from 'hono/logger'
import { getValidators , postValidator} from './utils/apiCalls';
import { Hono } from 'hono'
 
import { API_ENDPOINTS , ENV } from './utils/constants';
dotenv.config();
const app = new Hono()
app.use('*', prettyJSON({ space: 4 }) )
app.use('*', logger())
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))
 
 
 
 
// get validators
app.get('/', async (c) => { 
  const validater = await getValidators()    
  return c.json(validater.data)
})



 
 

 
 
console.log(`Server is running on port ${ENV.SERVER_PORT}`)

 
app.route('/route', validatorRouter)

 


 

 
serve({
  fetch: app.fetch,
  port : ENV.SERVER_PORT
})


 export default app