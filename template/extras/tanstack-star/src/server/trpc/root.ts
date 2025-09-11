import { createCallerFactory, createTRPCRouter } from './init'
import { coreRouter } from './routes/core.routes'

export const appRouter = createTRPCRouter({
	core: coreRouter,
})

export const createCaller = createCallerFactory(appRouter)

export type AppRouter = typeof appRouter
