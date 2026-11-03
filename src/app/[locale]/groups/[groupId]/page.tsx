import { notFound, redirect } from 'next/navigation'

import { isLocale } from '@/i18n/locales'

import { getUser } from '@/lib/auth/user'

import { getGroup } from '@/modules/Groups/query'
import { WorkspaceState } from '@/modules/WorkspaceState'

import GroupView from './_view'

export const dynamic = 'force-dynamic'
export default async function GroupPage({
  params,
}: {
  params: Promise<{ locale: string; groupId: string }>
}) {
  const { locale, groupId } = await params
  if (!isLocale(locale)) notFound()
  const user = await getUser()
  if (!user) redirect(`/${locale}/login`)
  const result = await getGroup(groupId)
  if (!result.ok) return <WorkspaceState error={result.error} />
  return <GroupView data={result.data} userId={user.id} locale={locale} />
}
