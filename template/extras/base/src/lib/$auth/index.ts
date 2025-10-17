import { createAuthClient } from 'better-auth/client'

export const $auth = createAuthClient({
	plugins: [],
})
export type $AuthClient = typeof $auth

export const { signIn, signOut, signUp, useSession } = $auth

export type ClientSession = typeof $auth.$Infer.Session
