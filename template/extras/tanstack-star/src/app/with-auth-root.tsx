import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
	useRouterState,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { TRPCClient } from "@trpc/client";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { Loader } from "~components/loader";
import { getServerSession } from "~server/auth";
import type { AppRouter } from "~server/trpc/root";
import appCss from "./index.css?url";

const fetchAuth = createServerFn().handler(async () => {
	const session = await getServerSession();
	return session;
});

export interface RouterAppContext {
	trpc: TRPCOptionsProxy<AppRouter>;
	queryClient: QueryClient;
	client: TRPCClient<AppRouter>;
	auth: Awaited<ReturnType<typeof getServerSession>>;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
	async beforeLoad() {
		const session = await fetchAuth();

		return {
			auth: session,
		};
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "My App",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	component: RootDocument,
});

function RootDocument() {
	const isFetching = useRouterState({ select: (s) => s.isLoading });
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body>
				<div className="grid h-svh grid-rows-[auto_1fr]">
					{isFetching ? <Loader /> : <Outlet />}
				</div>
				<Scripts />
			</body>
		</html>
	);
}
