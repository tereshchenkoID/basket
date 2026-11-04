import { databaseError } from '@/helpers/errors'

import { INVITE_TOKEN } from './schema'
import type { AcceptInviteInput, CreateInviteRecord, RevokeInviteInput } from './types'

import type { ActionResult } from '@/types/action'
import type { InvitePreview } from '@/types/database'
import type { DatabaseClient } from '@/types/supabase'

export const previewInvite = async (
  client: DatabaseClient,
  token: string,
): Promise<ActionResult<InvitePreview>> => {
  if (!INVITE_TOKEN.safeParse(token).success) return { ok: false, error: 'inviteInvalid' }

  try {
    const { data, error } = await client.rpc('preview_group_invite', { p_token: token })

    if (error) return { ok: false, error: databaseError(error) }
    if (!data?.[0]) return { ok: false, error: 'inviteInvalid' }

    return { ok: true, data: data[0] }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}

export const createInvite = (client: DatabaseClient, value: CreateInviteRecord) => client.rpc('create_group_invite', { p_group_id: value.groupId, p_token_hash: value.tokenHash })

export const acceptInvite = (client: DatabaseClient, value: AcceptInviteInput) => client.rpc('accept_group_invite', { p_token: value.token })

export const revokeInvite = (client: DatabaseClient, value: RevokeInviteInput) => client.rpc('revoke_group_invite', { p_invite_id: value.inviteId })
