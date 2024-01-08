import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import validatorRouter from './routes/validator'
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { prettyJSON } from 'hono/pretty-json'
import { logger } from 'hono/logger'
import { getValidators } from './utils/apiCalls';

dotenv.config();
const app = new Hono()
app.use('*', prettyJSON({ space: 4 }) )
app.use('*', logger())
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))
 


app.route('/route', validatorRouter)
 

app.get('/', async (c) => { 
  const validater = await getValidators()    
  return c.json(validater.data)
})

app.post('/', (c) => c.text('POST /'))
app.put('/', (c) => c.text('PUT /'))
app.delete('/', (c) => c.text('DELETE /'))


const port = parseInt(process.env.SERVER_PORT as string, 10) || 3030
console.log(`Server is running on port ${port}`)

// GET VALIDATORS : http://localhost:3030/route/validators?pretty

serve({
  fetch: app.fetch,
  port
})


 