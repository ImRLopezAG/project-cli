import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { createTRPCContext } from './trpc/init'
import { appRouter } from './trpc/root'

export { auth } from './auth'
export const fetchHandler = async (req: Request) =>
	await fetchRequestHandler({
		endpoint: '/api/trpc',
		router: appRouter,
		req,
		createContext: () =>
			createTRPCContext({
				headers: req.headers,
			}),
		onError:
			process.env.NODE_ENV === 'development'
				? ({ path, error }) => {
						const { code, message, cause } = error
						console.error(
							`❌ tRPC failed on ${path ?? '<no-path>'}: ${code} - ${cause}`,
						)
						return {
							status: 500,
							body: {
								error: {
									code,
									message,
									cause: cause instanceof Error ? cause.message : cause,
								},
							},
						}
					}
				: undefined,
		allowMethodOverride: true,
		allowBatching: true,
	})
