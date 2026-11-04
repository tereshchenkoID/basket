import { notFound, redirect } from 'next/navigation'

import { isLocale } from '@/i18n/locales'

import { getUser } from '@/lib/auth/user'

import { Empty } from '@/modules/Empty'
import { getGroup } from '@/modules/Groups/query'

import GroupView from './_view'

import type { GroupPageProps } from '@/types/routes'

export const dynamic = 'force-dynamic'

const GroupPage = async ({ params }: GroupPageProps) => {
  const { locale, 'group-id': groupId } = await params

  if (!isLocale(locale)) notFound()

  const user = await getUser()

  if (!user) redirect(`/${locale}/login`)

  const result = await getGroup(groupId)

  if (!result.ok) return (
    <Empty
      heading="h1"
      error={result.error}
    />
  )

  return (
    <GroupView
      data={result.data}
      userId={user.id}
      locale={locale}
    />
  )
}

export default GroupPage
