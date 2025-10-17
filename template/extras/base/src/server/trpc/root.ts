import { createCallerFactory, createTRPCRouter, publicProcedure, ServerEvents } from './init'
import { coreRouter } from './routes/core.routes'

const ee = new ServerEvents<{
	randomNumber: [number]
}>()
export const appRouter = createTRPCRouter({
	core: coreRouter,
	health: publicProcedure.query(() => 'OK'),
	randomNumber: publicProcedure.subscription(async function* (opts) {
		const interval = setInterval(() => {
			ee.emit('randomNumber', Math.random())
		}, 5_000)

		try {
			for await (const [data] of ee.toIterable('randomNumber', {
				signal: opts.signal,
			})) {
				yield data
			}
		} finally {
			clearInterval(interval)
		}
	}),
})

export const createCaller = createCallerFactory(appRouter)

export type AppRouter = typeof appRouter
