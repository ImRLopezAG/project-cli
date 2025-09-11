import path from "node:path";
import fs from "fs-extra";

import { extraDir, PKG_ROOT } from "~/consts.js";
import type { Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";

export const trpcInstallerNext: Installer = ({
	projectDir,
	packages,
	framework
}) => {
	addPackageDependency({
		projectDir,
		dependencies: [
			"@tanstack/react-query",
			"superjson",
			"@trpc/server",
			"@trpc/client",
			"@trpc/react-query",
			"@trpc/tanstack-react-query",
			"server-only"
		],
		devMode: false,
	});

	const usingAuth = packages?.["better-auth"].inUse;

	const TRPC_PATHS = {
		SERVER: {
			INIT: {
				DEST: "src/server/trpc/init.ts",
				WITH_AUTH: "src/server/trpc/with-auth-init.ts",
				NO_AUTH: "src/server/trpc/init.ts",
			},
			ROOT: {
				DEST: "src/server/trpc/root.ts",
				WITH_AUTH: "src/server/trpc/root.ts",
				NO_AUTH: "src/server/trpc/root.ts",
			},
			ROUTES: {
				DEST: "src/server/trpc/routes",
				WITH_AUTH: "src/server/trpc/routes",
				NO_AUTH: "src/server/trpc/routes",
			},
		},
		CLIENT: {
			SRC: "src/lib/trpc",
			DEST: "src/lib/trpc",
		},
		API_HANDLER: {
			DEST: "src/app/api/[trpc]/route.ts",
			SRC: "src/app/api/[trpc]/route.ts",
		}
	};

	const extrasDir = extraDir(framework);
	const copySrcDest: [string, string][] = [];

	copySrcDest.push([
		path.join(extrasDir, TRPC_PATHS.CLIENT.SRC),
		path.join(projectDir, TRPC_PATHS.CLIENT.DEST),
	]);
	copySrcDest.push([
		path.join(extrasDir, TRPC_PATHS.API_HANDLER.SRC),
		path.join(projectDir, TRPC_PATHS.API_HANDLER.DEST),
	]);

	Object.values(TRPC_PATHS.SERVER).forEach(({DEST, NO_AUTH, WITH_AUTH}) => {
		copySrcDest.push([
			path.join(extrasDir, usingAuth ? WITH_AUTH : NO_AUTH),
			path.join(projectDir, DEST),
		]);
	});

	copySrcDest.forEach(([src, dest]) => {
		fs.copySync(src, dest);
	});
};

export const trpcInstallerTTS: Installer = ({
	projectDir,
	packages,
	framework
}) => {
	addPackageDependency({
		projectDir,
		dependencies: [
			"@tanstack/react-query",
			"superjson",
			"@trpc/server",
			"@trpc/client",
			"@trpc/react-query",
			"@trpc/tanstack-react-query"
		],
		devMode: false,
	});

	const usingAuth = packages?.["better-auth"].inUse;

	const TRPC_PATHS = {
		SERVER: {
			INIT: {
				DEST: "src/server/trpc/init.ts",
				WITH_AUTH: "src/server/trpc/with-auth-init.ts",
				NO_AUTH: "src/server/trpc/init.ts",
			},
			ROOT: {
				DEST: "src/server/trpc/root.ts",
				WITH_AUTH: "src/server/trpc/root.ts",
				NO_AUTH: "src/server/trpc/root.ts",
			},
			ROUTES: {
				DEST: "src/server/trpc/routes",
				WITH_AUTH: "src/server/trpc/routes",
				NO_AUTH: "src/server/trpc/routes",
			},
		},
		CLIENT: {
			SRC: "src/lib/trpc",
			DEST: "src/lib/trpc",
		},
		API_HANDLER: {
			DEST: "src/app/api/trpc/$.ts",
			SRC: "src/app/api/trpc/$.ts",
		}
	};

	const extrasDir = extraDir(framework);
	const copySrcDest: [string, string][] = [];

	copySrcDest.push([
		path.join(extrasDir, TRPC_PATHS.CLIENT.SRC),
		path.join(projectDir, TRPC_PATHS.CLIENT.DEST),
	]);
	copySrcDest.push([
		path.join(extrasDir, TRPC_PATHS.API_HANDLER.SRC),
		path.join(projectDir, TRPC_PATHS.API_HANDLER.DEST),
	]);

	Object.values(TRPC_PATHS.SERVER).forEach(({DEST, NO_AUTH, WITH_AUTH}) => {
		copySrcDest.push([
			path.join(extrasDir, usingAuth ? WITH_AUTH : NO_AUTH),
			path.join(projectDir, DEST),
		]);
	});

	copySrcDest.forEach(([src, dest]) => {
		fs.copySync(src, dest);
	});
};