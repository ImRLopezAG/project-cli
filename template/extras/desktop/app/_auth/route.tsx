import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuth } from '~hooks/use-auth'

export const Route = createFileRoute('/_auth')({
	component: () => {
		const auth = useAuth(true)
		if (!auth) throw redirect({ to: '/sign-in' })
		return  (
		<main className='px-4 sm:px-12 lg:px-24'>
			<Outlet />
		</main>
	)
	},
	beforeLoad({ context: { auth } }) {
		if (!auth)
			throw redirect({
				to: '/sign-in',
			})
	},
})
