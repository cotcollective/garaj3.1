import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => request.cookies.get(name)?.value,
                  set: (name, value, options) => { response.cookies.set({ name, value, ...options }) },
                  remove: (name, options) => { response.cookies.set({ name, value: '', ...options }) } } }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  
  // Protected routes
  if (path.startsWith('/admin') && (!user || user.user_metadata?.role !== 'admin'))
    return NextResponse.redirect(new URL('/auth/login', request.url))
  
  if (path.startsWith('/garage') && !path.startsWith('/garage/onboarding'))
    if (!user || !['garage','admin'].includes(user.user_metadata?.role))
      return NextResponse.redirect(new URL('/auth/login', request.url))
  
  return response
}

export const config = { matcher: ['/admin/:path*','/garage/:path*','/diagnostic/result','/checkout'] }
