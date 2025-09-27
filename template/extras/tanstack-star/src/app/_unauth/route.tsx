import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_unauth')({
	component: Outlet,
	beforeLoad({ context: { auth } }) {
		if (auth)
			throw redirect({
				to: '/',
			})
	},
})
