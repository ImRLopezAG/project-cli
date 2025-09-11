import { type QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { TRPCClient } from "@trpc/client";
import type { PropsWithChildren } from "react";
import type { AppRouter } from "~/server/trpc/root";
import { TRPCProvider as TRPCProviderRoot } from "./index";
export interface TRPCProviderProps extends PropsWithChildren {
	queryClient: QueryClient;
	trpcClient: TRPCClient<AppRouter>;
}

export function TRPCProvider({
	trpcClient,
	queryClient,
	children,
}: TRPCProviderProps) {
	return (
		<TRPCProviderRoot trpcClient={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</TRPCProviderRoot>
	);
}
