import { AuthContext } from '~components/providers/auth'

import {type ClientSession, signOut } from '~lib/$auth'
import { use } from 'react'

type UseAuthReturn<T extends boolean> = T extends true
	? ClientSession & {
		signOut: typeof signOut
	}
	: ClientSession | null

export function useAuth<T extends boolean = false>(
	ensureAuth?: T,
): UseAuthReturn<T> {
	const context = use(AuthContext)
	if (!context) throw new Error('useAuth must be used within an AuthProvider')
	if (!context.data) {
		if (ensureAuth) {
			throw new Error('Authentication required')
		}
		return null as UseAuthReturn<T>
	}
	return {
		...context.data,
		signOut,
	} as UseAuthReturn<T>
}
