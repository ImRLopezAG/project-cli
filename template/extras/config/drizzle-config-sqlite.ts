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
