import type { z } from 'zod'

import type { ACCEPT_INVITE_SCHEMA, CREATE_INVITE_SCHEMA, REVOKE_INVITE_SCHEMA } from './schema'

export type CreateInviteRecord = Pick<z.output<typeof CREATE_INVITE_SCHEMA>, 'groupId'> & {
  tokenHash: string
}

export type AcceptInviteInput = z.output<typeof ACCEPT_INVITE_SCHEMA>

export type RevokeInviteInput = z.output<typeof REVOKE_INVITE_SCHEMA>
