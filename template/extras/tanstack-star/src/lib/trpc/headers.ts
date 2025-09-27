import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'

export const getServerHeaders = createServerFn({
	method: 'GET',
}).handler(() => {
	const headers = new Headers(getRequestHeaders())
	headers.set('x-trpc-source', 'rsc')

	return Object.fromEntries(headers.entries())
})
