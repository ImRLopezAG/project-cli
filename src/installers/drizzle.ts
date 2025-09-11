import path from "node:path";
import fs from "fs-extra";

import { extraDir,  PROVIDERS_NAME, CONFIG_ROOT } from "~/consts.js";
import type { Installer } from "~/installers/index.js";
import { addPackageDependency } from "~/utils/addPackageDependency.js";
import { addPackageScript } from "~/utils/addPackageScript.js";

const DEST = {
	INDEX: "src/server/db/entities/index.ts",
	SCHEMA: "src/server/db/entities/schemas.entity.ts",
	AUTH: "src/server/db/entities/auth.entity.ts",
	CLIENT: "src/server/db/index.ts",
	CONFIG: "drizzle.config.ts",
	ENTITIES_DIR: "src/server/db/entities",
} as const;

export const drizzleInstaller: Installer = ({
	projectDir,
	packages,
	scopedAppName,
	databaseProvider,
	framework,
	projectName
}) => {
	addPackageDependency({
		projectDir,
		dependencies: ["drizzle-kit"],
		devMode: true,
	});
	addPackageDependency({
		projectDir,
		dependencies: [
			"drizzle-orm",
			(
				{
					postgres: "postgres",
					sqlite: "@libsql/client",
				} as const
			)[databaseProvider],
		],
		devMode: false,
	});

	const extrasDir = extraDir(framework);

	const configFile = path.join(
		CONFIG_ROOT,
		`config/drizzle-config-${databaseProvider}.ts`,
	);
	const configDest = path.join(projectDir, DEST.CONFIG);

	const entitiesDir = path.join(extrasDir, DEST.ENTITIES_DIR);

	if (packages?.["better-auth"]) {
		switch (databaseProvider) {
			case "postgres": {
				const schemaFile = path.join(entitiesDir, `with-pg-schema.ts`);
				const schemaDest = path.join(
					projectDir,
					DEST.SCHEMA,
				);
				const authFile = path.join(entitiesDir, `with-pg-auth.ts`);
				const authDest = path.join(
					projectDir,
					DEST.AUTH,
				);
				const ENV_CONTENT = `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/${projectName}`
				const envPath = path.join(projectDir, ".env");

				if (!fs.existsSync(envPath)) {
					fs.writeFileSync(envPath, ENV_CONTENT);
				}

				fs.copySync(schemaFile, schemaDest);
				fs.copySync(authFile, authDest);
				break;
			}
			case "sqlite": {
				const authFile = path.join(entitiesDir, `with-sqlite-auth.ts`);
				const authDest = path.join(
					projectDir,
					DEST.AUTH,
				);
				fs.copySync(authFile, authDest);
				break;
			}
		}
	}
	const schemaFile = path.join(entitiesDir, `index.ts`);
	const schemaDest = path.join(projectDir, DEST.INDEX);
	const CLIENT_FILE = `src/server/db/${PROVIDERS_NAME[databaseProvider]}-index.ts`;

	const clientSrc = path.join(extrasDir, CLIENT_FILE);
	const clientDest = path.join(projectDir, DEST.CLIENT);

	addPackageScript({
		projectDir,
		scripts: {
			"db:push": "drizzle-kit push",
			"db:studio": "drizzle-kit studio",
			"db:generate": "drizzle-kit generate",
			"db:migrate": "drizzle-kit migrate",
		},
	});

	fs.copySync(configFile, configDest);
	fs.mkdirSync(path.dirname(schemaDest), { recursive: true });
	fs.copySync(schemaFile, schemaDest);
	fs.copySync(clientSrc, clientDest);

	// ENV file
	const envDest = path.join(projectDir, "src/lib/env.ts");
	const dbName = scopedAppName.replace(/-/g, "_");
	const envContent =
		databaseProvider === "sqlite"
			? SQLITE_ENV_CONTENT
			: PG_ENV_CONTENT(dbName);
	// Create empty env file to hydrate
	fs.appendFileSync(envDest, envContent);
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
`;

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
`;