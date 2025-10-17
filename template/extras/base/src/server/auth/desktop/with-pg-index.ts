import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { openAPI, username } from 'better-auth/plugins'
import { reactStartCookies } from 'better-auth/react-start'
import { env } from '~lib/env'
import { db } from '~server/db'
export const auth = betterAuth({
	secret: env.AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'pg',
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
	},
	plugins: [openAPI(), username(), reactStartCookies()],
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
})

export type Auth = typeof auth
