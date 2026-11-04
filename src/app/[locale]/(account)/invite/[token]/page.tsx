import type { Metadata } from 'next'

import { getAccount } from '@/app/actions/account'

import { previewInvite } from '@/lib/invites/query'
import { INVITE_TOKEN } from '@/lib/invites/schema'

import Section from './_view'
import type { InvitePageProps } from './types'

export const metadata: Metadata = {
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
}

const InvitePage = async ({ params }: InvitePageProps) => {
  const [
    { token }
  ] = await Promise.all([
    params,
    getAccount(),
  ])

  if (!INVITE_TOKEN.safeParse(token).success) return (
    <Section
      result={{ ok: false, error: 'inviteInvalid' }}
      token=""
    />
  )

  const result = await previewInvite(token)

  return (
    <Section
      result={result}
      token={token}
    />
  )
}

export default InvitePage
