import { getLocale } from 'next-intl/server'

import { getUser } from '@/app/actions/static'

import { isAuthConfigured } from '@/lib/config'

import Section from './_view'

const Home = async () => {
  const [
    locale,
    user
  ] = await Promise.all([
    getLocale(),
    getUser(),
  ])

  return (
    <Section
      locale={locale}
      authenticated={Boolean(user)}
      configured={isAuthConfigured()}
    />
  )
}

export default Home
