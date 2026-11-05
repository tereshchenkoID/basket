import { getLocale } from 'next-intl/server'

import { getAccount } from '@/app/actions/account'

import { getGroups } from '@/lib/groups/query'

import Section from './_view'

const Dashboard = async () => {
  const [
    locale,
    user
  ] = await Promise.all([
    getLocale(),
    getAccount(),
  ])

  const result = await getGroups()
  const now = new Date().getTime()

  return (
    <Section
      now={now}
      result={result}
      userId={user.id}
      locale={locale}
    />
  )
}

export default Dashboard
