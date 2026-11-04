import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { isLocale } from '@/i18n/locales'
import { routing } from '@/i18n/routing'

import { updateSession } from '@/lib/supabase/proxy'

const intl = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  const [locale, segment] = request.nextUrl.pathname.split('/').filter(Boolean)

  if (process.env.NODE_ENV !== 'development' && (locale === 'ui-kit' || (isLocale(locale) && segment === 'ui-kit'))) {
    return new NextResponse('Not found', { status: 404 })
  }

  const response = intl(request)

  if (response.headers.has('location')) return response

  return updateSession(request, response, intl)
}

export const config = { matcher: ['/((?!auth|api|_next|_vercel|.*\\..*).*)'] }
