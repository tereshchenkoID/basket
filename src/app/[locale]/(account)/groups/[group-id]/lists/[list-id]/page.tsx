import { getAccount } from '@/app/actions/account'

import { getList } from '@/lib/shopping/query'
import { getStores } from '@/lib/stores/query'

import Section from './_view'
import type { ListPageProps } from './types'

const ListPage = async ({ params }: ListPageProps) => {
  const [
    { 'group-id': groupId, 'list-id': listId },
    user
  ] = await Promise.all([
    params,
    getAccount(),
  ])

  const [result, stores] = await Promise.all([getList(groupId, listId), getStores()])

  return (
    <Section
      result={result}
      stores={stores.stores}
      storesAvailable={stores.available}
      userId={user.id}
    />
  )
}

export default ListPage
