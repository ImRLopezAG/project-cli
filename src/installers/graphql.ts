import path from "node:path";
import fs from "fs-extra";
import { extraDir } from "~/consts";
import type { AvailableDependencies } from "~/installers/dependencyVersionMap";
import type { Installer } from "~/installers/index";
import { addPackageDependency } from "~/utils/addPackageDependency";
export const graphqlInstaller: Installer = ({ projectDir, framework }) => {
	const deps: AvailableDependencies[] = [
		"@apollo/server",
		"@as-integrations/next",
		"graphql",
		"@graphql-tools/schema",
		'drizzle-graphql',
	];

	addPackageDependency({
		projectDir,
		dependencies: deps,
		devMode: false,
	});

	// GraphQL specific setup will be implemented later
	// This is a basic installer for now
  const extrasDir = extraDir(framework);

    const API_HANDLER_FILE = "src/app/api/graphql/route.ts";
    const apiHandlerSrc = path.join(extrasDir, API_HANDLER_FILE);
    const apiHandlerDest = path.join(projectDir, API_HANDLER_FILE);
  
    // Copy the GraphQL API route
    fs.copySync(apiHandlerSrc, apiHandlerDest);
};
