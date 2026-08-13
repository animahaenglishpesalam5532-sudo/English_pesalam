import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthRoute = pathname === '/admin'
  const isResetRoute = pathname === '/admin/reset-password'
  const isProtectedRoute = pathname.startsWith('/admin') && !isAuthRoute && !isResetRoute

  // Protect admin routes
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  // For signed-in users, resolve role to gate the staff / delivery areas
  let role: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()
    role = profile?.is_active ? profile.role : null
  }

  // Non-admin roles are limited to their own screens inside /admin.
  // Kept in sync with HOME_BY_ROLE in src/lib/auth/roles.ts (duplicated here
  // because middleware cannot import the server-only auth module).
  const ROLE_ROUTES: Record<string, string[]> = {
    staff: ['/admin/sales-entry', '/admin/my-records', '/admin/book-tracking'],
    delivery: ['/admin/book-tracking'],
  }
  const ROLE_HOME: Record<string, string> = {
    admin: '/admin/dashboard',
    staff: '/admin/sales-entry',
    delivery: '/admin/book-tracking',
  }
  // Unknown / inactive roles fall back to the salesperson screen, which renders
  // an "account not activated" notice instead of bouncing between routes.
  const home = ROLE_HOME[role ?? ''] ?? '/admin/sales-entry'

  if (isProtectedRoute && user && role !== 'admin') {
    const allowed = ROLE_ROUTES[role ?? ''] ?? ['/admin/sales-entry']
    if (!allowed.includes(pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = home
      return NextResponse.redirect(url)
    }
  }

  // Redirect authenticated user away from the login page
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = home
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
