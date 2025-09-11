import * as p from "@clack/prompts";
import chalk from "chalk";
import { Command } from "commander";

import { BASE_CLI_NAME, DEFAULT_APP_NAME } from "~/consts";
import {
	type AvailablePackages,
	type DatabaseProvider,
	databaseProviders,
} from "~/installers/index";
import { getVersion } from "~/utils/getT3Version";
import { getUserPkgManager } from "~/utils/getUserPkgManager";
import { IsTTYError } from "~/utils/isTTYError";
import { logger } from "~/utils/logger";
import { validateAppName } from "~/utils/validateAppName";
import { validateImportAlias } from "~/utils/validateImportAlias";

interface CliFlags {
	noGit: boolean;
	noInstall: boolean;
	default: boolean;
	importAlias: string;

	/** @internal Used in CI. */
	CI: boolean;
	/** @internal Used in CI. */
	tailwind: boolean;
	/** @internal Used in CI. */
	trpc: boolean;
	/** @internal Used in CI. */
	drizzle: boolean;
	/** @internal Used in CI. */
	betterAuth: boolean;
	/** @internal Used in CI. */
	appRouter: boolean;
	/** @internal Used in CI. */
	dbProvider: DatabaseProvider;
	/** @internal Used in CI */
	biome: boolean;
	/** @internal Used in CI */
	graphql: boolean;
}

interface CliResults {
	appName: string;
	packages: AvailablePackages[];
	flags: CliFlags;
		framework: string;
	
	databaseProvider: DatabaseProvider;
}

const defaultOptions: CliResults = {
	appName: DEFAULT_APP_NAME,
	packages: ["better-auth", "drizzle", "tailwind", "trpc", "biome"],
	framework: "next",
	flags: {
		noGit: false,
		noInstall: false,
		default: false,
		CI: false,
		tailwind: true,
		trpc: true,
		drizzle: true,
		betterAuth: true,
		importAlias: "@/",
		appRouter: true,
		dbProvider: "postgres",
		biome: true,
		graphql: false,
	},
	databaseProvider: "postgres",
};

export const runCli = async (): Promise<CliResults> => {
	const cliResults = defaultOptions;

	const program = new Command()
		.name(BASE_CLI_NAME)
		.description("A CLI for creating web applications with the fast vibe stack")
		.argument(
			"[dir]",
			"The name of the application, as well as the name of the directory to create",
		)
		.option(
			"--noGit",
			"Explicitly tell the CLI to not initialize a new git repo in the project",
			false,
		)
		.option(
			"--noInstall",
			"Explicitly tell the CLI to not run the package manager's install command",
			false,
		)
		.option(
			"-y, --default",
			"Bypass the CLI and use all default options to bootstrap a new t3-app",
			false,
		)
		.option(
			"--framework [framework]",
			"Choose the framework to use. Possible values: next, tanstack-star",
			"next",
		)
		/** BEGIN CI-FLAGS */
		.option(
			"--trpc [boolean]",
			"Experimental: Boolean value if we should install tRPC. Must be used in conjunction with `--CI`.",
			(value) => !!value && value !== "false",
		)
		.option(
			"--graphql [boolean]",
			"Experimental: Boolean value if we should install GraphQL. Must be used in conjunction with `--CI`.",
			(value) => !!value && value !== "false",
		)
		.option(
			"-i, --import-alias",
			"Explicitly tell the CLI to use a custom import alias",
			defaultOptions.flags.importAlias,
		)
		.option(
			"--dbProvider [provider]",
			`Choose a database provider to use. Possible values: ${databaseProviders.join(
				", ",
			)}`,
			defaultOptions.flags.dbProvider,
		)
		.option(
			"--appRouter [boolean]",
			"Explicitly tell the CLI to use the new Next app router",
			(value) => !!value && value !== "false",
		)
		/** END CI-FLAGS */
		.version(getVersion(), "-v, --version", "Display the version number")
		.addHelpText(
			"afterAll",
			`
Run ${chalk.bold.green("npx create-imr-app@latest")} to use the latest version without installing.
Visit ${chalk.underline.blue("https://imrlopez.dev/")} for more information.
      `,
		)
		.parse(process.argv);

	// FIXME: TEMPORARY WARNING WHEN USING YARN 3. SEE ISSUE #57
	if (process.env.npm_config_user_agent?.startsWith("yarn/3")) {
		logger.warn(`  WARNING: It looks like you are using Yarn 3. This is currently not supported,
  and likely to result in a crash. Please run create-imr-app with another
  package manager such as pnpm, npm, or Yarn Classic.
  See: https://github.com/t3-oss/create-imr-app/issues/57`);
	}

	// Needs to be separated outside the if statement to correctly infer the type as string | undefined
	const cliProvidedName = program.args[0];
	if (cliProvidedName) {
		cliResults.appName = cliProvidedName;
	}

	cliResults.flags = program.opts();

	/** @internal Used for CI E2E tests. */
	if (cliResults.flags.CI) {
		cliResults.packages = [];
		if (cliResults.flags.trpc) cliResults.packages.push("trpc");
		if (cliResults.flags.tailwind) cliResults.packages.push("tailwind");
		if (cliResults.flags.drizzle) cliResults.packages.push("drizzle");
		if (cliResults.flags.betterAuth) cliResults.packages.push("better-auth");
		if (cliResults.flags.biome) cliResults.packages.push("biome");
		if (cliResults.flags.graphql) cliResults.packages.push("graphql");

		if (databaseProviders.includes(cliResults.flags.dbProvider) === false) {
			logger.warn(
				`Incompatible database provided. Use: ${databaseProviders.join(", ")}. Exiting.`,
			);
			process.exit(0);
		}

		cliResults.databaseProvider = cliResults.packages.includes("drizzle")
			? cliResults.flags.dbProvider
			: "sqlite";

		return cliResults;
	}

	if (cliResults.flags.default) {
		return cliResults;
	}

	// Explained below why this is in a try/catch block
	try {
		if (process.env.TERM_PROGRAM?.toLowerCase().includes("mintty")) {
			logger.warn(`  WARNING: It looks like you are using MinTTY, which is non-interactive. This is most likely because you are
  using Git Bash. If that's that case, please use Git Bash from another terminal, such as Windows Terminal. Alternatively, you
  can provide the arguments from the CLI directly: https://create.t3.gg/en/installation#experimental-usage to skip the prompts.`);

			throw new IsTTYError("Non-interactive environment");
		}

		// if --CI flag is set, we are running in CI mode and should not prompt the user

		const pkgManager = getUserPkgManager();

		const project = await p.group(
			{
				...(!cliProvidedName && {
					name: () =>
						p.text({
							message: "What will your project be called?",
							defaultValue: cliProvidedName,
							validate: validateAppName,
						}),
				}),
				framework: () => {
					return p.select({
						message: "What framework would you like to use?",
						options: [
							{ value: "next", label: "Next.js" },
							{ value: "tanstack-star", label: "TanStack Star" },
						],
						initialValue: "next",
					});
				},
				authentication: () => {
					return p.select({
						message: "What authentication would you like to use?",
						options: [
							{ value: "none", label: "No authentication" },
							{ value: "better-auth", label: "Better Auth" },
						],
						initialValue: "better-auth",
					});
				},
				databaseProvider: () => {
					return p.select({
						message: "What database provider would you like to use?",
						options: [
							{ value: "postgres", label: "PostgreSQL" },
							{ value: "sqlite", label: "SQLite" },
						],
						initialValue: "postgres",
					});
				},
				apiLayer: ({results}) => {
					return p.select({
						message: "What API layer would you like to use?",
						options: [
							{ value: "trpc", label: "tRPC (recommended)" },
							...(results.framework === "next" ? [
								{ value: "graphql", label: "GraphQL" },
								{ value: "both", label: "Both tRPC and GraphQL" },
							] : [])
						],
						initialValue: "trpc",
					});
				},
				...(!cliResults.flags.noGit && {
					git: () => {
						return p.confirm({
							message:
								"Should we initialize a Git repository and stage the changes?",
							initialValue: !defaultOptions.flags.noGit,
						});
					},
				}),
				...(!cliResults.flags.noInstall && {
					install: () => {
						return p.confirm({
							message:
								`Should we run '${pkgManager}` +
								(pkgManager === "yarn" ? `'?` : ` install' for you?`),
							initialValue: !defaultOptions.flags.noInstall,
						});
					},
				}),
				importAlias: () => {
					return p.text({
						message: "What import alias would you like to use?",
						defaultValue: defaultOptions.flags.importAlias,
						placeholder: defaultOptions.flags.importAlias,
						validate: validateImportAlias,
					});
				},
			},
			{
				onCancel() {
					process.exit(1);
				},
			},
		);

		const packages: AvailablePackages[] = [];

		// Always include these defaults
		packages.push("tailwind", "drizzle", "biome");

		// Add authentication if selected
		if (project.authentication === "better-auth") packages.push("better-auth");

		// Add API layer based on selection
		if (project.apiLayer === "trpc") packages.push("trpc");
		if (project.apiLayer === "graphql") packages.push("graphql");
		if (project.apiLayer === "both") {
			packages.push("trpc", "graphql");
		}

		return {
			appName: project.name ?? cliResults.appName,
			packages,
			framework: project.framework,
			databaseProvider:
				(project.databaseProvider as DatabaseProvider) || "postgres",
			flags: {
				...cliResults.flags,
				appRouter: true, // Always use App Router
				noGit: !project.git || cliResults.flags.noGit,
				noInstall: !project.install || cliResults.flags.noInstall,
				importAlias: project.importAlias ?? cliResults.flags.importAlias,
			},
		};
	} catch (err) {
		// If the user is not calling create-imr-app from an interactive terminal, inquirer will throw an IsTTYError
		// If this happens, we catch the error, tell the user what has happened, and then continue to run the program with a default t3 app
		if (err instanceof IsTTYError) {
			logger.warn(`
  ${BASE_CLI_NAME} needs an interactive terminal to provide options`);

			const shouldContinue = await p.confirm({
				message: `Continue scaffolding a default T3 app?`,
				initialValue: true,
			});

			if (!shouldContinue) {
				logger.info("Exiting...");
				process.exit(0);
			}

			logger.info(`Bootstrapping a default T3 app in ./${cliResults.appName}`);
		} else {
			throw err;
		}
	}

	return cliResults;
};
