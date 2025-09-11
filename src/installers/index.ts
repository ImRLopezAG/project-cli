import {
	betterAuthInstallerNext,
	betterAuthInstallerTTS,
} from "~/installers/betterAuth";
import { tailwindInstallerNext, tailwindInstallerTTS } from "~/installers/tailwind";
import { trpcInstallerNext, trpcInstallerTTS } from "~/installers/trpc";
import type { PackageManager } from "~/utils/getUserPkgManager";
import { biomeInstaller } from "./biome";
import { dbContainerInstaller } from "./dbContainer";
import { drizzleInstaller } from "./drizzle";
import { graphqlInstaller } from "./graphql";

// Turning this into a const allows the list to be iterated over for programmatically creating prompt options
// Should increase extensibility in the future
export const availablePackages = [
	"better-auth",
	"drizzle",
	"tailwind",
	"trpc",
	"biome",
	"dbContainer",
	"graphql",
] as const;
export type AvailablePackages = (typeof availablePackages)[number];

export const databaseProviders = ["postgres", "sqlite"] as const;
export type DatabaseProvider = (typeof databaseProviders)[number];

export interface InstallerOptions {
	projectDir: string;
	pkgManager: PackageManager;
	noInstall: boolean;
	packages?: PkgInstallerMap;
	appRouter?: boolean;
	projectName: string;
	scopedAppName: string;
	framework: string;
	databaseProvider: DatabaseProvider;
}

export type Installer = (opts: InstallerOptions) => void;

export type PkgInstallerMap = Record<
	AvailablePackages,
	{
		inUse: boolean;
		installer: Installer;
	}
>;

export const buildPkgInstallerMapNext = (
	packages: AvailablePackages[],
	databaseProvider: DatabaseProvider,
): PkgInstallerMap => ({
	"better-auth": {
		inUse: packages.includes("better-auth"),
		installer: betterAuthInstallerNext,
	},
	drizzle: {
		inUse: packages.includes("drizzle"),
		installer: drizzleInstaller,
	},
	tailwind: {
		inUse: packages.includes("tailwind"),
		installer: tailwindInstallerNext,
	},
	trpc: {
		inUse: packages.includes("trpc"),
		installer: trpcInstallerNext,
	},
	dbContainer: {
		inUse: ["postgres"].includes(databaseProvider),
		installer: dbContainerInstaller,
	},
	biome: {
		inUse: packages.includes("biome"),
		installer: biomeInstaller,
	},
	graphql: {
		inUse: packages.includes("graphql"),
		installer: graphqlInstaller,
	},
});

export const buildPkgInstallerMapTTS = (
	packages: AvailablePackages[],
	databaseProvider: DatabaseProvider,
): PkgInstallerMap => ({
	"better-auth": {
		inUse: packages.includes("better-auth"),
		installer: betterAuthInstallerTTS,
	},
	drizzle: {
		inUse: packages.includes("drizzle"),
		installer: drizzleInstaller,
	},
	tailwind: {
		inUse: packages.includes("tailwind"),
		installer: tailwindInstallerTTS,
	},
	trpc: {
		inUse: packages.includes("trpc"),
		installer: trpcInstallerTTS,
	},
	dbContainer: {
		inUse: ["postgres"].includes(databaseProvider),
		installer: dbContainerInstaller,
	},
	biome: {
		inUse: packages.includes("biome"),
		installer: biomeInstaller,
	},
	graphql: {
		inUse: packages.includes("graphql"),
		installer: graphqlInstaller,
	},
});
