import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

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
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login when accessing protected routes
  if (request.nextUrl.pathname.startsWith("/protected") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Admin route protection (except login page)
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/admin-auth/login')) {
    
    if (!user) {
      // Redirect to admin login if not authenticated
      const url = request.nextUrl.clone()
      url.pathname = "/admin-auth/login"
      return NextResponse.redirect(url)
    }

    try {
      // Check if user is an admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .eq('is_active', true)
        .single()

      if (adminError || !adminUser) {
        // Redirect to admin login if not an admin
        const url = request.nextUrl.clone()
        url.pathname = "/admin-auth/login"
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Admin auth check error:', error)
      // Redirect to admin login on any error
      const url = request.nextUrl.clone()
      url.pathname = "/admin-auth/login"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
