import { createTRPCRouter, publicProcedure } from "~server/trpc/init";

export const coreRouter = createTRPCRouter({
	getPublicMessage: publicProcedure.query(() => {
		return "This is a public message!";
	}),
});
