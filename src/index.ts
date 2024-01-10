import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import validatorRouter from './routes/validator'
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { prettyJSON } from 'hono/pretty-json'
import { logger } from 'hono/logger'
import { getValidators , postValidator} from './utils/apiCalls';
import { ApolloClient, InMemoryCache, ApolloProvider, gql } from '@apollo/client';
import { GET_ALL_ROLLUPS } from './subGraphQueries';
 


dotenv.config();
const app = new Hono()
app.use('*', prettyJSON({ space: 4 }) )
app.use('*', logger())
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))
 


const client = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/55430/nexus/version/latest',
  cache: new InMemoryCache(),
});
 
app.get('/', async (c) => { 
  const result = client.query({ query :GET_ALL_ROLLUPS })
  return c.json(result)
})


// app.get('/', async (c) => { 
//   const validater = await getValidators()    
//   return c.json(validater.data)
// })



// app.post('/', async (c) => { 


//   const validator = {
//     public_key: "0xa488083ea223f1b63b97438cc6c0da53c2c951ebc36e7a839e41dc91d445d356a7137a36c716d0146e25721a0ffcff8c" ,
//     validator_index:  "602",
//     cluster_id:  "2",
//     balance:  "34887677910",
//     status: "	active_ongoing",
//     score: "99",
//     rollupname:  "scroll",
//   }

//   // // Post the validator data to the database
//   const validatorResult = await postValidator({ validator })
//   return c.json(
//     {
//       message: 'validator Created',
//     },
//     200,
//     {
//       'X-Custom': 'Thank you',
//     }
//   )

//  })


app.put('/', (c) => c.text('PUT /'))
app.delete('/', (c) => c.text('DELETE /'))

 
const port = parseInt(process.env.SERVER_PORT as string, 10) || 3030
console.log(`Server is running on port ${port}`)

// GET VALIDATORS : http://localhost:3030/route/validators?pretty
app.route('/route', validatorRouter)

app.get('/posts', (c) => {
  return c.text('Many posts')
})


app.post('/posts', (c) => {
  return c.json(
    {
      message: 'Created',
    },
    201,
    {
      'X-Custom': 'Thank you',
    }
  )
})

 
serve({
  fetch: app.fetch,
  port
})


 export default app