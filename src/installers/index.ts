import {
	betterAuthInstaller
} from '~/installers/betterAuth'
import {
	tailwindInstaller
} from '~/installers/tailwind'
import { trpcInstaller } from '~/installers/trpc'
import type { PackageManager } from '~/utils/getUserPkgManager'
import { biomeInstaller } from './biome'
import { dbContainerInstaller } from './dbContainer'
import { drizzleInstaller } from './drizzle'
import { fbteeInstaller } from './fbtee'
import { graphqlInstaller } from './graphql'
// Turning this into a const allows the list to be iterated over for programmatically creating prompt options
// Should increase extensibility in the future
export const availablePackages = [
	'better-auth',
	'drizzle',
	'tailwind',
	'trpc',
	'biome',
	'dbContainer',
	'graphql',
	'fbtee',
] as const
export type AvailablePackages = (typeof availablePackages)[number]

export const databaseProviders = ['postgres', 'sqlite'] as const
export type DatabaseProvider = (typeof databaseProviders)[number]

export interface InstallerOptions {
	projectDir: string
	pkgManager: PackageManager
	noInstall: boolean
	packages?: PkgInstallerMap
	appRouter?: boolean
	projectName: string
	scopedAppName: string
	framework: string
	databaseProvider: DatabaseProvider
	pgLite: boolean
}

export type Installer = (opts: InstallerOptions) => void

export type PkgInstallerMap = Record<
	AvailablePackages,
	{
		inUse: boolean
		installer: Installer
	}
>

export const buildPkgInstaller = (
	packages: AvailablePackages[],
	databaseProvider: DatabaseProvider,
): PkgInstallerMap => ({
	fbtee: {
		inUse: packages.includes('fbtee'),
		installer: fbteeInstaller,
	},
	'better-auth': {
		inUse: packages.includes('better-auth'),
		installer: betterAuthInstaller,
	},
	drizzle: {
		inUse: packages.includes('drizzle'),
		installer: drizzleInstaller,
	},
	tailwind: {
		inUse: packages.includes('tailwind'),
		installer: tailwindInstaller,
	},
	trpc: {
		inUse: packages.includes('trpc'),
		installer: trpcInstaller,
	},
	dbContainer: {
		inUse: ['postgres'].includes(databaseProvider),
		installer: dbContainerInstaller,
	},
	biome: {
		inUse: packages.includes('biome'),
		installer: biomeInstaller,
	},
	graphql: {
		inUse: packages.includes('graphql'),
		installer: graphqlInstaller,
	},
})
