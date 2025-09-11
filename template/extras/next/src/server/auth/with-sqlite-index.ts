import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { openAPI, username } from 'better-auth/plugins'
import { headers } from 'next/headers'
import React from 'react'
import { env } from '~lib/env'
import { db } from '~server/db'
export const auth = betterAuth({
	secret: env.AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'sqlite',
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
	},
	plugins: [openAPI(), username(), nextCookies()],
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60,
		},
	},
})

export const getServerSession = React.cache(async () => {
	return await auth.api.getSession({
		headers: await headers(),
	})
})
export type Auth = typeof auth
