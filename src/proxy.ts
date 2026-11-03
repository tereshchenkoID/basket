import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { routing } from '@/i18n/routing'

import { updateSession } from '@/lib/supabase/proxy'

const intl = createMiddleware(routing)

export async function proxy(request: NextRequest) {
  const response = intl(request)

  if (response.headers.has('location')) return response

  return updateSession(request, response, intl)
}

export const config = { matcher: ['/((?!auth|api|_next|_vercel|.*\\..*).*)'] }
