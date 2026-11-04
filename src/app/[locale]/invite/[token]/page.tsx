import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { isLocale } from '@/i18n/locales'

import { getUser } from '@/lib/auth/user'

import { Empty } from '@/modules/Empty'
import { previewInvite } from '@/modules/Invites/query'
import { inviteToken } from '@/modules/Invites/schema'

import InviteView from './_view'

import type { InvitePageProps } from '@/types/routes'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
}

const InvitePage = async ({ params }: InvitePageProps) => {
  const { locale, token } = await params

  if (!isLocale(locale)) notFound()
  if (!inviteToken.safeParse(token).success) return (
    <Empty
      heading="h1"
      error="inviteInvalid"
    />
  )

  const user = await getUser()

  if (!user) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/invite/${token}`)}`)

  const result = await previewInvite(token)

  if (!result.ok) return (
    <Empty
      heading="h1"
      error={result.error}
    />
  )

  return (
    <InviteView
      preview={result.data}
      token={token}
    />
  )
}

export default InvitePage
