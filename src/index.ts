#!/usr/bin/env node
import path from "node:path";
import { execa } from "execa";
import fs from "fs-extra";
import type { PackageJson } from "type-fest";

import { runCli } from "~/cli/index.js";
import { createProject } from "~/helpers/createProject.js";
import { initializeGit } from "~/helpers/git.js";
import { logNextSteps } from "~/helpers/logNextSteps.js";
import { setImportAlias } from "~/helpers/setImportAlias.js";
import {
	buildPkgInstallerMapNext,
	buildPkgInstallerMapTTS,
} from "~/installers/index.js";
import { getUserPkgManager } from "~/utils/getUserPkgManager.js";
import { logger } from "~/utils/logger.js";
import { parseNameAndPath } from "~/utils/parseNameAndPath.js";
import { renderTitle } from "~/utils/renderTitle.js";
import { formatProject } from "./helpers/format.js";
import { installDependencies } from "./helpers/installDependencies.js";
import { getVersion } from "./utils/getT3Version.js";
import {
	getNpmVersion,
	renderVersionWarning,
} from "./utils/renderVersionWarning.js";

type CT3APackageJSON = PackageJson & {
	imrMetadata?: {
		initVersion: string;
	};
};

const main = async () => {
	const npmVersion = await getNpmVersion();
	const pkgManager = getUserPkgManager();
	renderTitle();
	if (npmVersion) {
		renderVersionWarning(npmVersion);
	}

	const {
		appName,
		packages,
		flags: { noGit, noInstall, importAlias, appRouter },
		databaseProvider,
		framework,
	} = await runCli();

	const usePackages = {
		next: buildPkgInstallerMapNext(packages, databaseProvider),
		'tanstack-star': buildPkgInstallerMapTTS(packages, databaseProvider),
	}[framework];

	if (!usePackages) {
		logger.error(`Unsupported framework: ${framework}`);
		process.exit(1);
	}

	// e.g. dir/@mono/app returns ["@mono/app", "dir/app"]
	const [scopedAppName, appDir] = parseNameAndPath(appName);

	const projectDir = await createProject({
		projectName: appDir,
		scopedAppName,
		packages: usePackages,
		databaseProvider,
		importAlias,
		framework,
		noInstall,
		appRouter,
	});

	// Write name to package.json
	const pkgJson = fs.readJSONSync(
		path.join(projectDir, "package.json"),
	) as CT3APackageJSON;
	pkgJson.name = scopedAppName;
	pkgJson.imrMetadata = { initVersion: getVersion() };

	// ? Bun doesn't support this field (yet)
	if (pkgManager !== "bun") {
		const { stdout } = await execa(pkgManager, ["-v"], {
			cwd: projectDir,
		});
		pkgJson.packageManager = `${pkgManager}@${stdout.trim()}`;
	}

	fs.writeJSONSync(path.join(projectDir, "package.json"), pkgJson, {
		spaces: 2,
	});

	// update import alias in any generated files if not using the default
	if (importAlias !== "~/") {
		setImportAlias(projectDir, importAlias);
	}

	if (!noInstall) {
		await installDependencies({ projectDir });
		await formatProject({
			pkgManager,
			projectDir,
			biome: packages.includes("biome"),
		});
	}

	if (!noGit) {
		await initializeGit(projectDir);
	}

	await logNextSteps({
		projectName: appDir,
		packages: usePackages,
		appRouter,
		noInstall,
		projectDir,
		databaseProvider,
	});

	process.exit(0);
};

main().catch((err) => {
	logger.error("Aborting installation...");
	if (err instanceof Error) {
		logger.error(err);
	} else {
		logger.error(
			"An unknown error has occurred. Please open an issue on github with the below:",
		);
		console.log(err);
	}
	process.exit(1);
});
