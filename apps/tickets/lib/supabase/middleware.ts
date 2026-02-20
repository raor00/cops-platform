import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const WEB_APP_URL = (process.env.WEB_URL || 'https://cops-platform-web.vercel.app').replace(/\/$/, '')

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Si no hay Supabase configurado, redirigir al login de la web app
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${WEB_APP_URL}/login`)
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: Array<{
            name: string
            value: string
            options?: {
              domain?: string
              expires?: Date
              httpOnly?: boolean
              maxAge?: number
              path?: string
              sameSite?: 'lax' | 'strict' | 'none' | boolean
              secure?: boolean
            }
          }>
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Keep logic after getUser to avoid random logout issues.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Only bridge route remains public in tickets.
  const publicRoutes = ['/auth/bridge']
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(`${WEB_APP_URL}/login`)
  }

  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
