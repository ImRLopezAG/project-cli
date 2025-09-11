import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { env } from "~lib/env";
import { createTRPCContext } from "~server/trpc/init";
import { appRouter } from "~server/trpc/root";

const handler = (req: NextRequest) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: () => createTRPCContext({ headers: req.headers }),
		onError:
			env.NODE_ENV === "development"
				? ({ path, error }) => {
						const { code, cause } = error;
						console.error(
							`❌ tRPC failed on ${path ?? "<no-path>"}: ${code} - ${cause}`,
						);
					}
				: undefined,
		allowMethodOverride: true,
	});
export { handler as GET, handler as POST };
