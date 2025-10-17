import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "~server/trpc/root";

export const { TRPCProvider, useTRPC, useTRPCClient } =
	createTRPCContext<AppRouter>();

export {
	skipToken,
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseInfiniteQuery,
	useSuspenseQuery,
} from '@tanstack/react-query'
export { useSubscription } from '@trpc/tanstack-react-query'
export type { AppRouter }
