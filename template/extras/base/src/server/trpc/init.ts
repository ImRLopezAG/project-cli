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
		headers
	};
}

const t = initTRPC.context<typeof createTRPCContext>().create({
	transformer: superjson,
	sse: {
		enabled: true
	},
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

import { EventEmitter, on } from "node:events";
export class ServerEvents<T extends Record<string, any[]>> extends EventEmitter<T> {
	toIterable<TEventName extends keyof T & string>(
		eventName: TEventName,
		opts?: NonNullable<Parameters<typeof on>[2]>,
	): AsyncIterable<T[TEventName]> {
		return on(this as EventEmitter, eventName, opts) as AsyncIterable<
			T[TEventName]
		>
	}
}