import type { PropsWithChildren } from 'react'

export const dynamic = 'force-static'
export default async function AuthLayout({ children }: PropsWithChildren) {
	return <>{children}</>
}
