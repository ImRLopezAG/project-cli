import { createServerFn } from "@tanstack/react-start"
import { getHeaders } from "@tanstack/react-start/server"

export const getServerHeaders = createServerFn({
  method: 'GET',
}).handler(() => {
  const headers = new Headers(getHeaders() as unknown as Headers)
  headers.set('x-trpc-source', 'rsc')

  return Object.fromEntries(headers.entries())
})
