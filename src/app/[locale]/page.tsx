import { notFound } from 'next/navigation'

import { isLocale } from '@/i18n/locales'

import { getUser } from '@/lib/auth/user'
import { isAuthConfigured } from '@/lib/config'

import HomeView from './_view'

import type { LocalePageProps } from '@/types/routes'

export const dynamic = 'force-dynamic'

const Home = async ({ params }: LocalePageProps) => {
  const { locale } = await params

  if (!isLocale(locale)) notFound()

  const user = await getUser()

  return (
    <HomeView
      locale={locale}
      authenticated={Boolean(user)}
      configured={isAuthConfigured()}
    />
  )
}

export default Home
