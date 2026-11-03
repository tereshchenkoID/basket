import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

import { isLocale } from '@/i18n/locales'

import { nextForLocale, safeNext } from '@/lib/auth/redirect'
import { getSupabaseConfig, isAuthConfigured } from '@/lib/config'

import type { Database } from '@/types/database'

export async function updateSession(
  request: NextRequest,
  response: NextResponse,
  localize: (request: NextRequest) => NextResponse,
) {
  const [, locale, page] = request.nextUrl.pathname.split('/')

  if (!isLocale(locale)) return response

  const config = getSupabaseConfig()
  let authenticated = false

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
      const { data, error } = await supabase.auth.getClaims()
      authenticated = !error && Boolean(data?.claims.sub)
    } catch {
      /* Fail closed on network/auth errors. */
    }
  }

  let destination: string | null = null

  if (['dashboard', 'groups'].includes(page) && !authenticated) {
    destination = `/${locale}/login${isAuthConfigured() ? '' : '?error=configuration'}`
  } else if (
    page === 'invite' &&
    !authenticated &&
    safeNext(request.nextUrl.pathname) === request.nextUrl.pathname
  ) {
    const params = new URLSearchParams({ next: request.nextUrl.pathname })

    if (!isAuthConfigured()) params.set('error', 'configuration')

    destination = `/${locale}/login?${params}`
  } else if (page === 'login' && authenticated)
    destination = nextForLocale(request.nextUrl.searchParams.get('next'), locale)
  if (destination) {
    const redirect = NextResponse.redirect(new URL(destination, request.url))
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie))
    response = redirect
  }

  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  return response
}
