/*
 * This maps the necessary packages to a version.
 * This improves performance significantly over fetching it from the npm registry.
 */
export const dependencyVersionMap = {
	// Auth
	"better-auth": "1.3.18",

	// Drizzle
	"drizzle-kit": "0.31.5",
	"drizzle-orm": "0.44.5",
	postgres: "3.4.7",
	"@libsql/client": "0.15.15",

	// TailwindCSS
	tailwindcss: "4.1.13",
	postcss: "8.5.3",
	"@tailwindcss/postcss": "4.0.15",
	"@tailwindcss/vite": "4.1.13",

	// tRPC
	"@trpc/client": "11.6.0",
	"@trpc/next": "11.6.0",
	"@trpc/react-query": "11.6.0",
	"@trpc/server": "11.6.0",
	"@tanstack/react-query": "5.90.2",
	superjson: "2.2.1",
	"server-only": "0.0.1",
	"@trpc/tanstack-react-query": "11.6.0",

	// biome
	"@biomejs/biome": "2.2.2",

	// GraphQL
	"@apollo/server": "5.0.0",
	"@as-integrations/next": "4.0.0",
	graphql: "16.8.1",
	"@graphql-tools/schema": "10.0.0",
	'drizzle-graphql': '0.8.5',
} as const;
export type AvailableDependencies = keyof typeof dependencyVersionMap;
