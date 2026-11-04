import { notFound, redirect } from 'next/navigation'

import { isLocale } from '@/i18n/locales'

import { getUser } from '@/lib/auth/user'

import { Empty } from '@/modules/Empty'
import { getList } from '@/modules/Shopping/query'

import ListView from './_view'

import type { ListPageProps } from '@/types/routes'

export const dynamic = 'force-dynamic'

const ListPage = async ({ params }: ListPageProps) => {
  const { locale, 'group-id': groupId, 'list-id': listId } = await params

  if (!isLocale(locale)) notFound()

  const user = await getUser()

  if (!user) redirect(`/${locale}/login`)

  const result = await getList(groupId, listId)

  if (!result.ok) return (
    <Empty
      heading="h1"
      error={result.error}
    />
  )

  return (
    <ListView
      data={result.data}
      userId={user.id}
    />
  )
}

export default ListPage
