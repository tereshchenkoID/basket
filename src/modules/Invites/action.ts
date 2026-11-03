'use server'

import { createHash, randomBytes } from 'node:crypto'

import { getSiteUrl } from '@/lib/config'
import { mutate } from '@/lib/supabase/mutation'

import { acceptInviteSchema, createInviteSchema, revokeInviteSchema } from './schema'

export async function createInvite(input: unknown) {
  const token = randomBytes(32).toString('base64url')
  const result = await mutate(createInviteSchema, input, (client, value) =>
    client.rpc('create_group_invite', {
      p_group_id: value.groupId,
      p_token_hash: createHash('sha256').update(token).digest('hex'),
    }),
  )

  if (!result.ok) return result

  const parsed = createInviteSchema.parse(input)

  return {
    ok: true as const,
    data: { id: result.data, url: new URL(`/${parsed.locale}/invite/${token}`, getSiteUrl()).href },
  }
}

export async function acceptInvite(input: unknown) {
  return mutate(acceptInviteSchema, input, (client, value) =>
    client.rpc('accept_group_invite', { p_token: value.token }),
  )
}

export async function revokeInvite(input: unknown) {
  return mutate(revokeInviteSchema, input, (client, value) =>
    client.rpc('revoke_group_invite', { p_invite_id: value.inviteId }),
  )
}
