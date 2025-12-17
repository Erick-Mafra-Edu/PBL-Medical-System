import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'

// List of protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/courses',
  '/flashcards',
  '/library',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is protected
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  if (isProtected) {
    const session = await auth()

    if (!session?.user) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Allow auth pages to be accessed by unauthenticated users
  if (pathname.startsWith('/auth')) {
    const session = await auth()

    if (session?.user && (pathname === '/auth/login' || pathname === '/auth/register')) {
      // Redirect authenticated users to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
