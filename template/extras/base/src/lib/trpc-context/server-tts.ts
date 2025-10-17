import { getRequestHeaders } from "@tanstack/react-start/server";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { createTRPCContext } from "~server/trpc/init";
import type { AppRouter } from "~server/trpc/root";
import { createCaller } from "~server/trpc/root";
import { queryClient } from "./context";
/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
export const createContext = cache(async () => {
	const headers = new Headers(getRequestHeaders());
	headers.set("x-trpc-source", "rsc");

	return createTRPCContext({ headers });
});

const caller = createCaller(createContext);
const getQueryClient = cache(() => queryClient);

export const { trpc: api } = createHydrationHelpers<AppRouter>(
	caller,
	getQueryClient,
);
