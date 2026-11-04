import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import { getUser } from '@/app/actions/static'

import { nextForLocale } from '@/lib/auth/redirect'
import { isAuthConfigured } from '@/lib/config'

import Section from './_view'
import type { LoginProps } from './types'

const Login = async ({ searchParams }: LoginProps) => {
  const [locale, user, query] = await Promise.all([
    getLocale(),
    getUser(),
    searchParams,
  ])

  const next = nextForLocale(query.next, locale)

  if (user) redirect(next)

  const error = query.error
    ? query.error === 'configuration'
      ? 'configuration'
      : 'oauth'
    : undefined

  return (
    <Section
      locale={locale}
      next={next}
      error={error}
      configured={isAuthConfigured()}
    />
  )
}

export default Login
