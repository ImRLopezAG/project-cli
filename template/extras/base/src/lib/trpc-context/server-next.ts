import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers as heads } from "next/headers";
import { cache } from "react";
import "server-only";
import { createTRPCContext } from "~server/trpc/init";
import { type AppRouter, createCaller } from "~server/trpc/root";
import { queryClient } from "./context";
/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
export const createContext = cache(async () => {
	const headers = new Headers(await heads());
	headers.set("x-trpc-source", "rsc");

	return createTRPCContext({ headers });
});

const getQueryClient = cache(() => queryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
	caller,
	getQueryClient,
);
