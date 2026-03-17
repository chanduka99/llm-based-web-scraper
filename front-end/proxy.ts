import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const publicRoutes = ['/auth/signin', '/auth/signup']
const authRoutes = ['/auth/signin', '/auth/signup']

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname)
    const isAuthRoute = authRoutes.includes(req.nextUrl.pathname)

    // Redirect authenticated users away from auth routes
    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    // Redirect unauthenticated users to signin
    if (!isPublicRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
