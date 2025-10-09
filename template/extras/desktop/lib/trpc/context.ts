import type { AppRouter } from '~server/trpc/root'
import {
	defaultShouldDehydrateQuery,
	QueryCache,
	QueryClient,
} from '@tanstack/react-query'
import {
	createTRPCClient,
	httpBatchStreamLink,
	httpSubscriptionLink,
	splitLink,
} from '@trpc/client'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { cache } from 'react'
import { toast } from 'sonner'
import SuperJSON from 'superjson'
import { getServerHeaders } from './headers'

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			toast.error(error.message, {
				action: {
					label: 'retry',
					onClick: () => {
						queryClient.invalidateQueries()
					},
				},
			})
		},
	}),
	defaultOptions: {
		queries: { staleTime: 60 * 1000 },
		dehydrate: {
			serializeData: SuperJSON.serialize,
			shouldDehydrateQuery: (query) =>
				defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
		},
		hydrate: {
			deserializeData: SuperJSON.deserialize,
		},
	},
})

export const client = createTRPCClient<AppRouter>({
	links: [
		splitLink({
			condition: (op) => op.type === 'subscription',
			true: httpSubscriptionLink({
				url: '/api/trpc',
				transformer: SuperJSON,
			}),

			false: httpBatchStreamLink({
				transformer: SuperJSON,
				url: '/api/trpc',
				headers: async () => {
					const headers = new Headers(await getServerHeaders())
					return headers
				},
				fetch: (url, options) => {
					return fetch(url, {
						...options,
						credentials: 'include',
					})
				},
			}),
		}),
	],
})

export const trpc = createTRPCOptionsProxy({
	client,
	queryClient,
})

export const getContext = cache(() => {
	return {
		trpc,
		queryClient,
		client,
	} as const
})
