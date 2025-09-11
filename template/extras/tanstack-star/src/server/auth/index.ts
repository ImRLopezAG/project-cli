import { getHeaders } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, username } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { reactStartCookies } from "better-auth/react-start";
import { env } from "~lib/env";
import { db } from "~server/db";

export const auth = betterAuth({
	secret: env.AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		requireEmailVerification: true,
	},
	emailVerification: {
		sendVerificationEmail: async ({ url }) => {
			console.log(`Verify your email by clicking on this link: ${url}`);
		},
		autoSignInAfterVerification: true,
		sendOnSignUp: true,
	},
	plugins: [openAPI(), username(), passkey(), reactStartCookies()],
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
});

export async function getServerSession() {
	const headers = new Headers(getHeaders() as unknown as Headers);
	return await auth.api.getSession({
		headers,
	});
}

export type Auth = typeof auth;
