import { auth, fetchHandler } from '@app/server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', logger())

app.get('/', (c) => {
	return c.text('Hello Hono!')
})

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
	return auth.handler(c.req.raw)
})

app.use('/api/trpc/*', async (c) => {
	return await fetchHandler(c.req.raw)
})
export default app
