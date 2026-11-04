import { getLocale } from 'next-intl/server'

import { getAccount } from '@/app/actions/account'

import { getGroup } from '@/lib/groups/query'

import Section from './_view'
import type { GroupPageProps } from './types'

const GroupPage = async ({ params }: GroupPageProps) => {
  const [
    { 'group-id': groupId },
    locale,
    user
  ] = await Promise.all([
    params,
    getLocale(),
    getAccount(),
  ])

  const result = await getGroup(groupId)

  return (
    <Section
      result={result}
      userId={user.id}
      locale={locale}
    />
  )
}

export default GroupPage
