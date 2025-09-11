'use client'
import { QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { getContext } from './context'
import { TRPCProvider } from './index'
export function TRPCReactProvider({ children }: PropsWithChildren) {
	const { client, queryClient } = getContext()
	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={client} queryClient={queryClient}>
				{children}
			</TRPCProvider>
		</QueryClientProvider>
	)
}
