import { type NextRequest, NextResponse } from 'next/server'

import { NAVIGATION } from '@/constant/navigation'

import { localeFromNext, safeNext } from '@/lib/auth/redirect'
import { getSiteUrl, isAuthConfigured } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const next = safeNext(params.get('next'))
  const locale = localeFromNext(next)
  // No request Host or forwarded header is used to build OAuth redirects.
  let origin: string

  try {
    origin = getSiteUrl()
  } catch {
    return new NextResponse('Application configuration is incomplete.', { status: 503 })
  }

  const fail = (error: 'oauth' | 'configuration') => {
    const url = new URL(`/${locale}${NAVIGATION.login.url}`, origin)
    url.searchParams.set('error', error)
    url.searchParams.set('next', next)
    const response = NextResponse.redirect(url)
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('Referrer-Policy', 'no-referrer')

    return response
  }

  if (!isAuthConfigured()) return fail('configuration')

  const code = params.get('code')

  if (!code || params.has('error')) return fail('oauth')

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) return fail('oauth')

    const response = NextResponse.redirect(new URL(next, origin))
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('Referrer-Policy', 'no-referrer')

    return response
  } catch {
    return fail('oauth')
  }
}
