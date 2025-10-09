import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError, z } from "zod/v4";
import { auth } from "~server/auth";
import { db } from "~server/db";

interface TrpcContext {
	headers: Headers;
}

export async function createTRPCContext({ headers }: TrpcContext) {
	const session = await auth.api.getSession({
		headers,
	});
	return {
		db,
		session,
		auth,
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

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.session?.user) {
		throw new TRPCError({
			code: "UNAUTHORIZED",
			message: "User is not authorized",
		});
	}
	return next({
		ctx: {
			// infers the `session` as non-nullable
			session: { ...ctx.session },
			user: ctx.session.user,
		},
	});
});
