import { notFound, redirect } from 'next/navigation'

import { isLocale } from '@/i18n/locales'

import { getUser } from '@/lib/auth/user'

import { getList } from '@/modules/Shopping/query'
import { WorkspaceState } from '@/modules/WorkspaceState'

import ListView from './_view'

export const dynamic = 'force-dynamic'
export default async function ListPage({
  params,
}: {
  params: Promise<{ locale: string; groupId: string; listId: string }>
}) {
  const { locale, groupId, listId } = await params
  if (!isLocale(locale)) notFound()
  const user = await getUser()
  if (!user) redirect(`/${locale}/login`)
  const result = await getList(groupId, listId)
  if (!result.ok) return <WorkspaceState error={result.error} />
  return <ListView data={result.data} userId={user.id} />
}
