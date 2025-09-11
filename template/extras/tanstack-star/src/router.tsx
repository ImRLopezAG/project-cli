import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { Loader } from "~components/loader";
import { Providers } from "~components/providers";
import { getContext } from "~lib/trpc/context";
import { TRPCProvider } from "~lib/trpc/react";
import { routeTree } from "./routeTree.gen";

export const createRouter = () => {
	const context = getContext();
	const router = createTanStackRouter({
		routeTree,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0,
		context: { ...context },
		defaultPendingComponent: () => <Loader />,
		defaultNotFoundComponent: () => <div>Not Found</div>,
		Wrap: ({ children }: Props) => (
			<TRPCProvider
				trpcClient={context.client}
				queryClient={context.queryClient}
			>
				<Providers>{children}</Providers>
			</TRPCProvider>
		),
	});
	setupRouterSsrQueryIntegration({ router, queryClient: context.queryClient });
	return router;
};

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof createRouter>;
	}
}
