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

  // For signed-in users, resolve role to gate staff vs admin areas
  let role: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()
    role = profile?.is_active ? profile.role : null
  }

  // Staff may only access the sales-entry and their own records screens inside /admin
  const staffAllowed = pathname === '/admin/sales-entry' || pathname === '/admin/my-records'
  if (isProtectedRoute && user && role !== 'admin' && !staffAllowed) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/sales-entry'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated user away from the login page
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = role === 'admin' ? '/admin/dashboard' : '/admin/sales-entry'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
