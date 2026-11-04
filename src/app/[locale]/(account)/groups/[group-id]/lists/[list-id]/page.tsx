import { getAccount } from '@/app/actions/account'

import { getList } from '@/lib/shopping/query'

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

  const result = await getList(groupId, listId)

  return (
    <Section
      result={result}
      userId={user.id}
    />
  )
}

export default ListPage
