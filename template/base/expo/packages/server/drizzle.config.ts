import { defineConfig } from 'drizzle-kit'
import { env } from './src/lib/env'
export default defineConfig({
	dialect: 'postgresql',
	driver: 'pglite',
	dbCredentials: {
		url: env.DATABASE_URL
	},
	verbose: true,
	casing: 'snake_case',
	schema: './src/db/**/*.entity.ts',
	out: './drizzle',
	schemaFilter: ['auth', 'core']
})
