import path from "node:path";
import fs from "fs-extra";

import { extraDir, PROVIDERS_NAME } from "~/consts";
import type { AvailableDependencies } from "~/installers/dependencyVersionMap";
import type { Installer } from "~/installers/index";
import { addPackageDependency } from "~/utils/addPackageDependency";
import { addPackageScript } from "~/utils/addPackageScript";

export const betterAuthInstallerNext: Installer = ({
	projectDir,
	packages,
	databaseProvider,
	framework,
}) => {
	const usingDrizzle = packages?.drizzle.inUse;

	const deps: AvailableDependencies[] = ["better-auth"];

	addPackageDependency({
		projectDir,
		dependencies: deps,
		devMode: false,
	});

	const extrasDir = extraDir(framework);

	const API_HANDLER_FILE = "src/app/api/auth/[...all]/route.ts";
	const apiHandlerSrc = path.join(extrasDir, API_HANDLER_FILE);
	const apiHandlerDest = path.join(projectDir, API_HANDLER_FILE);

	// Copy the Better Auth API route
	fs.copySync(apiHandlerSrc, apiHandlerDest);

	const API_CLIENT_FILE = "src/lib/$auth/index.ts";
	const apiClientSrc = path.join(extrasDir, API_CLIENT_FILE);
	const apiClientDest = path.join(projectDir, API_CLIENT_FILE);

	const AUTH_MIDDLEWARE_FILE = "src/middleware.ts";
	const authMiddlewareSrc = path.join(extrasDir, AUTH_MIDDLEWARE_FILE);
	const authMiddlewareDest = path.join(projectDir, AUTH_MIDDLEWARE_FILE);

	const AUTH_HOOKS_FILE = "src/hooks/use-auth.ts";
	const authHooksSrc = path.join(extrasDir, AUTH_HOOKS_FILE);
	const authHooksDest = path.join(projectDir, AUTH_HOOKS_FILE);

	// Copy the Better Auth API client
	fs.copySync(apiClientSrc, apiClientDest);
	fs.copySync(authMiddlewareSrc, authMiddlewareDest);
	fs.copySync(authHooksSrc, authHooksDest);

	if (usingDrizzle) {
		const API_CONFIG_FILE = `src/server/auth/${PROVIDERS_NAME[databaseProvider]}-index.ts`;

		const authConfigSrc = path.join(extrasDir, API_CONFIG_FILE);
		const authConfigDest = path.join(projectDir, "src/server/auth/index.ts");

		// Ensure the directory exists
		fs.ensureDirSync(path.dirname(authConfigDest));
		fs.copySync(authConfigSrc, authConfigDest);
	}
	addPackageScript({
		projectDir,
		scripts: {
			"auth:gen":
				"@better-auth/cli generate --config ./src/server/auth/index.ts",
		},
	});
};

export const betterAuthInstallerTTS: Installer = ({
	projectDir,
	packages,
	databaseProvider,
	framework,
}) => {
	const usingDrizzle = packages?.drizzle.inUse;

	const deps: AvailableDependencies[] = ["better-auth"];

	addPackageDependency({
		projectDir,
		dependencies: deps,
		devMode: false,
	});

	const extrasDir = extraDir(framework);

	const API_HANDLER_FILE = "src/app/api/auth/$.ts";
	const apiHandlerSrc = path.join(extrasDir, API_HANDLER_FILE);
	const apiHandlerDest = path.join(projectDir, API_HANDLER_FILE);

	// Copy the Better Auth API route
	fs.copySync(apiHandlerSrc, apiHandlerDest);

	const API_CLIENT_FILE = "src/lib/$auth/index.ts";
	const apiClientSrc = path.join(extrasDir, API_CLIENT_FILE);
	const apiClientDest = path.join(projectDir, API_CLIENT_FILE);

	const AUTH_HOOKS_FILE = "src/hooks/use-auth.ts";
	const authHooksSrc = path.join(extrasDir, AUTH_HOOKS_FILE);
	const authHooksDest = path.join(projectDir, AUTH_HOOKS_FILE);

	// Copy the Better Auth API client
	fs.copySync(apiClientSrc, apiClientDest);
	fs.copySync(authHooksSrc, authHooksDest);

	if (usingDrizzle) {
		const API_CONFIG_FILE = `src/server/auth/${PROVIDERS_NAME[databaseProvider]}-index.ts`;

		const authConfigSrc = path.join(extrasDir, API_CONFIG_FILE);
		const authConfigDest = path.join(projectDir, "src/server/auth/index.ts");

		// Ensure the directory exists
		fs.ensureDirSync(path.dirname(authConfigDest));
		fs.copySync(authConfigSrc, authConfigDest);
	}
};
