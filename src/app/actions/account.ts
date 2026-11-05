import { cache } from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import { NAVIGATION, ROUTES_USER } from '@/constant/navigation'

import { getUser } from '@/app/actions/static'

import { safeNext } from '@/lib/auth/redirect'
import { isAuthConfigured } from '@/lib/config'

import 'server-only'

export const getAccount = cache(async () => {
  const user = await getUser()

  if (!user) {
    const [
      locale,
      requestHeaders
    ] = await Promise.all([
      getLocale(),
      headers(),
    ])
    const pathname = requestHeaders.get('x-basket-pathname')
    const query = new URLSearchParams()

    if (pathname?.startsWith(`/${locale}${ROUTES_USER.invite.url('')}`) && safeNext(pathname) === pathname)
      query.set('next', pathname)

    if (!isAuthConfigured()) query.set('error', 'configuration')

    redirect(`/${locale}${NAVIGATION.login.url}${query.size ? `?${query}` : ''}`)
  }

  return user
})
