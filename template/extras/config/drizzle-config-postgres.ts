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
