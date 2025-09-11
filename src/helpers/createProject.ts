import fs from "node:fs";
import path from "node:path";

import { PKG_ROOT } from "~/consts";
import { installPackages } from "~/helpers/installPackages";
import {
	selectComponentFile,
	selectLayoutFile,
	selectPageFile,
} from "~/helpers/nextBoilerPlate";
import { scaffoldProject } from "~/helpers/scaffoldProject";
import {
	selectComponentFileRoutes,
	selectRouteFile,
	selectRouterFile,
} from "~/helpers/ttsBoilerplate";
import type { DatabaseProvider, PkgInstallerMap } from "~/installers/index";
import { getUserPkgManager } from "~/utils/getUserPkgManager";

interface CreateProjectOptions {
	projectName: string;
	packages: PkgInstallerMap;
	scopedAppName: string;
	noInstall: boolean;
	importAlias: string;
	appRouter: boolean;
	framework: string;
	databaseProvider: DatabaseProvider;
}

export const createProject = async ({
	projectName,
	scopedAppName,
	packages,
	noInstall,
	appRouter,
	framework,
	databaseProvider,
}: CreateProjectOptions) => {
	const pkgManager = getUserPkgManager();
	const projectDir = path.resolve(process.cwd(), projectName);

	// Bootstraps the base Next.js application
	await scaffoldProject({
		projectName,
		projectDir,
		pkgManager,
		scopedAppName,
		noInstall,
		appRouter,
		databaseProvider,
		framework,
	});

	// Install the selected packages
	installPackages({
		projectName,
		scopedAppName,
		projectDir,
		pkgManager,
		packages,
		noInstall,
		appRouter,
		databaseProvider,
		framework,
	});

	if (framework === "next") {
		fs.copyFileSync(
			path.join(PKG_ROOT, "template/extras/config/next-config.ts"),
			path.join(projectDir, "next.config.ts"),
		);
		selectLayoutFile({ projectDir, packages, framework });
		selectPageFile({ projectDir, packages, framework });
		selectComponentFile({ projectDir, packages, framework });
	}

	if (framework === "tanstack-star") {
		selectRouterFile({ projectDir, packages, framework });
		selectRouteFile({ projectDir, packages, framework });
		selectComponentFileRoutes({ projectDir, packages, framework });
	}

	return projectDir;
};
