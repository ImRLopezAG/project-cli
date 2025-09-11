import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_unauth')({
	component: Outlet,
	beforeLoad({ context: { auth }, location }) {
		console.log('Unauth route beforeLoad', { auth, location })
		if (auth)
			throw redirect({
				to: '/',
			})
	},
})
