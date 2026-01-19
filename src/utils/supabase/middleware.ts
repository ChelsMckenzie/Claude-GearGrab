import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isValidSupabaseUrl(url: string | undefined): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    // Must be HTTPS and contain supabase in the hostname
    return parsed.protocol === 'https:' && parsed.hostname.includes('supabase')
  } catch {
    return false
  }
}

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip Supabase auth check if credentials are not properly configured
  // This ensures builds don't hang when env vars are missing or invalid
  if (!isValidSupabaseUrl(supabaseUrl) || !supabaseAnonKey || supabaseAnonKey.startsWith('sb_')) {
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    })

    await supabase.auth.getUser()
  } catch {
    // Silently fail - auth check is optional during development/build
  }

  return supabaseResponse
}
