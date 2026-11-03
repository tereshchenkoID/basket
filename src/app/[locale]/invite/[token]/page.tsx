import { notFound, redirect } from 'next/navigation'

import { isLocale } from '@/i18n/locales'

import { getUser } from '@/lib/auth/user'

import { previewInvite } from '@/modules/Invites/query'
import { inviteToken } from '@/modules/Invites/schema'
import { WorkspaceState } from '@/modules/WorkspaceState'

import InviteView from './_view'

type InvitePageProps = {
  params: Promise<{
    locale: string
    token: string
  }>
}

export const dynamic = 'force-dynamic'

export const metadata = {
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
} as const

const InvitePage = async ({ params }: InvitePageProps) => {
  const { locale, token } = await params

  if (!isLocale(locale)) notFound()
  if (!inviteToken.safeParse(token).success) return <WorkspaceState error="inviteInvalid" />

  const user = await getUser()

  if (!user) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/invite/${token}`)}`)

  const result = await previewInvite(token)

  if (!result.ok) return <WorkspaceState error={result.error} />

  return <InviteView preview={result.data} token={token} />
}

export default InvitePage
