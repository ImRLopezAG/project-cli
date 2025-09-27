import { env } from '~lib/env';
import { createFileRoute } from '@tanstack/react-router'
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "~server/trpc/init";
import { appRouter } from "~server/trpc/root";

function handler({ request }: { request: Request }) {
	return fetchRequestHandler({
		req: request,
		router: appRouter,
		createContext: async () => createTRPCContext({ headers: request.headers }),
		endpoint: '/api/trpc',
		onError:
			env.NODE_ENV === 'development'
				? ({ path, error }) => {
						const { code, cause, ...message } = error
						console.error(
							`❌ tRPC failed on ${path ?? '<no-path>'}: ${code} - ${cause} - ${JSON.stringify(message)}`,
						)
					}
				: undefined,
		allowMethodOverride: true,
	})
}

export const Route = createFileRoute('/api/trpc/$')({
	server: {
		handlers: {
			GET: handler,
			POST: handler,
		}
	}
})