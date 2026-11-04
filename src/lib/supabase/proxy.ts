import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

import { isLocale } from '@/i18n/locales'

import { getSupabaseConfig, isAuthConfigured } from '@/lib/config'

import type { Database } from '@/types/database'

export async function updateSession(
  request: NextRequest,
  response: NextResponse,
  localize: (request: NextRequest) => NextResponse,
) {
  const [, locale] = request.nextUrl.pathname.split('/')

  if (!isLocale(locale)) return response

  const config = getSupabaseConfig()

  if (config && isAuthConfigured()) {
    // Preserve next-intl's rewrite headers while forwarding refreshed cookies.
    const supabase = createServerClient<Database>(config.url, config.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values, headers) {
          values.forEach(({ name, value }) => request.cookies.set(name, value))
          const previousCookies = response.cookies.getAll()
          response = localize(request)
          previousCookies.forEach(cookie => response.cookies.set(cookie))
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options))

          if (headers)
            Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value))
        },
      },
    })

    try {
      await supabase.auth.getClaims()
    } catch {
      /* The account gate verifies the user before protected data is loaded. */
    }
  }

  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  return response
}
