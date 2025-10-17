import path from 'node:path'
import fs from 'fs-extra'

import { BASE_ROOT, PROVIDERS_NAME } from '~/consts.js'
import type { Installer } from '~/installers/index.js'
import { addPackageDependency } from '~/utils/addPackageDependency.js'
import { addPackageScript } from '~/utils/addPackageScript.js'

export const drizzleInstaller: Installer = ({
	projectDir,
	packages,
	scopedAppName,
	databaseProvider,
	projectName,
	framework,
	pgLite
}) => {
	addPackageDependency({
		projectDir,
		dependencies: ['drizzle-kit'],
		devMode: true,
	})
	addPackageDependency({
		projectDir,
		dependencies: [
			'drizzle-orm',
			(
				{
					postgres: pgLite ? '@electric-sql/pglite' : 'postgres',
					sqlite: '@libsql/client',
				} as const
			)[databaseProvider],
		],
		devMode: false,
	})
	addPackageScript({
		projectDir,
		scripts: {
			'db:push': 'drizzle-kit push',
			'db:studio': 'drizzle-kit studio',
			'db:generate': 'drizzle-kit generate',
			'db:migrate': 'drizzle-kit migrate',
		},
	})
	const WITH_AUTH = !!packages?.['better-auth']

	const CONFIG_CONTENT = {
		sqlite: SQLITE_CONFIG_CONTENT,
		postgres: pgLite ? PG_LITE_CONFIG_CONTENT : PG_CONFIG_CONTENT,
	}[databaseProvider]

	const DB_PATH = drizzlePaths(framework, PROVIDERS_NAME[databaseProvider], pgLite)
	const copySrcDest: [string, string][] = []

	copySrcDest.push([DB_PATH.CLIENT_FILE.SRC, path.join(projectDir, DB_PATH.CLIENT_FILE.DEST)])

	if (WITH_AUTH) {
		copySrcDest.push([DB_PATH.AUTH_FILE.SRC, path.join(projectDir, DB_PATH.AUTH_FILE.DEST)])
		if (databaseProvider === 'postgres') {
			copySrcDest.push([DB_PATH.SCHEMA_FILE.SRC, path.join(projectDir, DB_PATH.SCHEMA_FILE.DEST)])
			const ENV_CONTENT = `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${projectName}`
			const envPath = path.join(projectDir, '.env')

			if (!fs.existsSync(envPath)) {
				fs.appendFileSync(envPath, ENV_CONTENT)
			}
		}
	}

	const ENV_CONTENT = {
		sqlite: SQLITE_ENV_CONTENT,
		postgres: pgLite ? PG_LITE_ENV_CONTENT : PG_ENV_CONTENT(scopedAppName.replace(/-/g, '_')),
	}[databaseProvider]

	fs.appendFileSync(path.join(projectDir, DB_PATH.CONFIG_FILE.DEST), CONFIG_CONTENT)
	fs.writeFileSync(
		path.join(projectDir, DB_PATH.ENV_FILE.DEST),
		ENV_CONTENT,
	)

	copySrcDest.forEach(([src, dest]) => {
		fs.copySync(src, dest)
	})
}

function drizzlePaths(framework: string, db: string, pgLite: boolean) {
	const srcDir =
		{
			next: 'src',
			'tanstack-star': 'src',
			desktop: 'src/renderer',
		}[framework] || 'src'

	const DB_PATHS = {
		CLIENT_FILE: {
			SRC: path.join(BASE_ROOT, `src/server/db/${db}-${pgLite ? 'lite-' : ''}index.ts`),
			DEST: `${srcDir}/server/db/index.ts`,
		},
		CONFIG_FILE: {
			DEST: 'drizzle.config.ts',
		},
		ENV_FILE: {
			DEST: `${srcDir}/lib/env.ts`,
		},
		AUTH_FILE: {
			SRC: path.join(BASE_ROOT, `src/server/db/entities/${db}-auth.ts`),
			DEST: `${srcDir}/server/db/entities/auth.entity.ts`,
		},
		ENTITIES_DIR: {
			SRC: path.join(BASE_ROOT, 'src/server/db/entities'),
			DEST: `${srcDir}/server/db/entities`,
		},
		SCHEMA_FILE: {
			SRC: path.join(BASE_ROOT, `src/server/db/entities/${db}-schema.ts`),
			DEST: `${srcDir}/server/db/entities/schemas.entity.ts`,
		},
	}

	return DB_PATHS
}

const PG_ENV_CONTENT = (db: string) => `
import { z } from 'zod'

export const env = z
	.object({
		NODE_ENV: z
			.enum(['development', 'production', 'test'])
			.default('development'),
		DATABASE_URL: z.string().default('postgres://postgres:postgres@localhost:5432/${db}'),
		AUTH_SECRET: z.string().default('SUPER_SECRET_KEY'),
	})
	.parse(process.env)
`

const SQLITE_ENV_CONTENT = `
import { z } from 'zod'

export const env = z
	.object({
		NODE_ENV: z
			.enum(['development', 'production', 'test'])
			.default('development'),
		DATABASE_URL: z.string().default('file:./src/server/db/dev.db'),
		DB_AUTH_TOKEN: z.string().optional(),
		AUTH_SECRET: z.string().default('SUPER_SECRET_KEY'),
	})
	.parse(process.env)
`
const SQLITE_CONFIG_CONTENT = `
import { env } from "~lib/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: env.NODE_ENV === "production" ? "turso" : "sqlite",
	schema: "./src/server/db/entities/*.entity.ts",
	out: "./drizzle/migrations",
	dbCredentials: {
		url: env.DATABASE_URL,
		authToken: env.DB_AUTH_TOKEN,
	},
	strict: true,
	verbose: true,
	casing: "snake_case",
});
`

const PG_CONFIG_CONTENT = `
import { env } from '~lib/env'
import { defineConfig } from 'drizzle-kit'
export default defineConfig({
	dialect: 'postgresql',
	schema: './src/server/db/entities/*.entity.ts',
	out: './drizzle/migrations',
	dbCredentials: {
		url: env.DATABASE_URL,
	},
	strict: true,
	verbose: true,
	casing: 'snake_case',
	schemaFilter: ['auth', 'core'],
})
`
const PG_LITE_CONFIG_CONTENT = `
import { env } from '~lib/env'
import { defineConfig } from 'drizzle-kit'
export default defineConfig({
	dialect: 'postgresql',
	driver: 'pglite',
	schema: './src/server/db/entities/*.entity.ts',
	out: './drizzle/migrations',
	dbCredentials: {
		url: env.DATABASE_URL,
	},
	strict: true,
	verbose: true,
	casing: 'snake_case',
	schemaFilter: ['auth', 'core'],
})
`
const PG_LITE_ENV_CONTENT = `
import { z } from 'zod'

export const env = z
	.object({
		NODE_ENV: z
			.enum(['development', 'production', 'test'])
			.default('development'),
		DATABASE_URL: z.string().default('./src/server/db/dev.db'),
		DB_AUTH_TOKEN: z.string().optional(),
		AUTH_SECRET: z.string().default('SUPER_SECRET_KEY'),
	})
	.parse(process.env)
`