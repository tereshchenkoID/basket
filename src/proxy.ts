import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { isLocale } from '@/i18n/locales'
import { ROUTING } from '@/i18n/routing'

import { ROUTES_DEV } from '@/constant/navigation'

import { updateSession } from '@/lib/supabase/proxy'

const intl = createMiddleware(ROUTING)

export async function proxy(request: NextRequest) {
  const [locale, segment] = request.nextUrl.pathname.split('/').filter(Boolean)

  const uiKit = ROUTES_DEV.uiKit.url.slice(1)

  if (process.env.NODE_ENV !== 'development' && (locale === uiKit || (isLocale(locale) && segment === uiKit))) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Overwrite caller-provided values before forwarding the request to server components.
  request.headers.set('x-basket-pathname', request.nextUrl.pathname)

  const response = intl(request)

  if (response.headers.has('location')) return response

  return updateSession(request, response, intl)
}

export const config = {
  matcher: ['/((?!auth(?:/|$)|ocr(?:/|$)|api(?:/|$)|_next(?:/|$)|_vercel(?:/|$)|basket\\.svg$).*)'],
}
