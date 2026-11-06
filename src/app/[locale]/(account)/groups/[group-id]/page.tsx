import { getLocale } from 'next-intl/server'

import { getAccount } from '@/app/actions/account'

import { getGroup } from '@/lib/groups/query'
import { getStores } from '@/lib/stores/query'

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

  const [result, stores] = await Promise.all([getGroup(groupId), getStores()])

  return (
    <Section
      result={result}
      stores={stores.stores}
      storesAvailable={stores.available}
      userId={user.id}
      locale={locale}
    />
  )
}

export default GroupPage
