import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError, z } from "zod/v4";
import { db } from "~server/db";

interface TrpcContext {
	headers: Headers;
}

export async function createTRPCContext({ headers }: TrpcContext) {
	return {
		db,
	};
}

const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson,
	errorFormatter: ({ shape, error }) => ({
		...shape,
		data: {
			...shape.data,
			zodError:
				error.cause instanceof ZodError
					? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
					: null,
		},
	}),
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
