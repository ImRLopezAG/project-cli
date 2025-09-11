import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'

const UNAUTH_ROUTES = ['/sign-up', '/sign-in']

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	// Allow all API routes to proceed without authentication checks
	if (pathname.startsWith('/api/')) {
		return NextResponse.next()
	}

	// Get session from cookies
	const session = getSessionCookie(request)
	const isAuthenticated = !!session
	const isUnauthRoute = UNAUTH_ROUTES.includes(pathname)

	// If user is authenticated and trying to access auth pages, redirect to home
	if (isAuthenticated && isUnauthRoute) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	// If user is not authenticated and trying to access protected pages, redirect to sign-in
	if (!isAuthenticated && !isUnauthRoute) {
		return NextResponse.redirect(new URL('/sign-in', request.url))
	}

	// Allow the request to proceed
	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
	runtime: 'nodejs',
}
