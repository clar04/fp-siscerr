import fastifyMongodb from '@fastify/mongodb'
import Fastify from 'fastify'
import dotenv from 'dotenv'

dotenv.config()

const fastify = Fastify({
  logger: true
})

fastify.register(fastifyMongodb, {
  forceClose: true,
  url: process.env.MONGODB_URI
})

fastify.get('/', async (_request, _reply) => {
  return { success: true, date: new Date() }
})

fastify.get('/sensors', async (_request, reply) => {
  const collection = fastify.mongo.db.collection('sensors')
  const result = await collection.find().toArray()
  if (result.length === 0) {
    return reply.code(404).send({ success: false, message: 'No sensor data found' })
  }
  return { success: true, data: result }
})

fastify.post(
  '/sensors',
  {
    schema: {
      body: {
        type: 'object',
        required: ['1st_sensor', '2nd_sensor', '3rd_sensor', '4th_sensor'],
        properties: {
          '1st_sensor': { type: 'number' },
          '2nd_sensor': { type: 'number' },
          '3rd_sensor': { type: 'number' },
          '4th_sensor': { type: 'number' },
        }
      }
    }
  },
  async (request, reply) => {
    const collection = fastify.mongo.db.collection('sensors')
    const result = await collection.insertOne(request.body)
    return reply.code(201).send({ success: true, insertedId: result.insertedId })
  }
)

const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()