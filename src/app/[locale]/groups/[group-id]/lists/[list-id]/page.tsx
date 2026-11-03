import { notFound, redirect } from 'next/navigation'

import { isLocale } from '@/i18n/locales'

import { getUser } from '@/lib/auth/user'

import { getList } from '@/modules/Shopping/query'
import { WorkspaceState } from '@/modules/WorkspaceState'

import ListView from './_view'

type ListPageProps = {
  params: Promise<{
    locale: string
    'group-id': string
    'list-id': string
  }>
}

export const dynamic = 'force-dynamic'

const ListPage = async ({ params }: ListPageProps) => {
  const { locale, 'group-id': groupId, 'list-id': listId } = await params

  if (!isLocale(locale)) notFound()

  const user = await getUser()

  if (!user) redirect(`/${locale}/login`)

  const result = await getList(groupId, listId)

  if (!result.ok) return <WorkspaceState error={result.error} />

  return <ListView data={result.data} userId={user.id} />
}

export default ListPage
