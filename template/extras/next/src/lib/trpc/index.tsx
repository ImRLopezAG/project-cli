"use client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "~server/trpc/root";

export const { TRPCProvider, useTRPC, useTRPCClient } =
	createTRPCContext<AppRouter>();
export {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
export type { AppRouter };
