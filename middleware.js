// Vercel Edge Middleware — gates /via/* behind a cookie check.
// Uses Web Platform APIs (Request, Response) — works in any Vercel project.

export const config = {
  matcher: ['/via/:path*'],
}

export default function middleware(request) {
  const url = new URL(request.url)
  const { pathname } = url

  // Let the login page itself through so users can authenticate
  if (pathname === '/via/login' || pathname === '/via/login.html') {
    return
  }

  // Check for the via-auth cookie
  const cookieHeader = request.headers.get('cookie') || ''
  const hasAuth = /(?:^|;\s*)via-auth=1(?:;|$)/.test(cookieHeader)

  if (!hasAuth) {
    const loginUrl = new URL('/via/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return Response.redirect(loginUrl, 302)
  }

  // Authenticated — let through
  return
}
