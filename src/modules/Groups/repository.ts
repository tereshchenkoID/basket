import { databaseError } from '@/helpers/errors'
import { uuid } from '@/helpers/validation'

import type { ActionResult } from '@/types/action'
import type { GroupSummary } from '@/types/database'
import type { CreateGroupRecord, RemoveMemberInput, RenameGroupInput } from '@/types/inputs'
import type { DatabaseClient } from '@/types/supabase'
import type { GroupData } from '@/types/workspace'

export const getGroups = async (
  client: DatabaseClient,
): Promise<ActionResult<GroupSummary[]>> => {
  try {
    const { data, error } = await client.rpc('dashboard_groups')

    return error ? { ok: false, error: databaseError(error) } : { ok: true, data }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}

export const getGroup = async (
  client: DatabaseClient,
  groupId: string,
): Promise<ActionResult<GroupData>> => {
  if (!uuid.safeParse(groupId).success) return { ok: false, error: 'forbidden' }

  try {
    const group = await client.from('groups').select('*').eq('id', groupId).maybeSingle()

    if (group.error) return { ok: false, error: databaseError(group.error) }
    if (!group.data) return { ok: false, error: 'forbidden' }

    const [members, lists, invites] = await Promise.all([
      client.rpc('group_member_profiles', { p_group_id: groupId }),
      client.from('shopping_lists').select('*').eq('group_id', groupId).order('created_at'),
      client
        .from('group_invites')
        .select('id, expires_at, use_count, revoked_at')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false }),
    ])
    const error = members.error ?? lists.error ?? invites.error

    if (error) return { ok: false, error: databaseError(error) }

    // Membership may be revoked between reads; fail closed if the checked RPC failed.
    return {
      ok: true,
      data: {
        group: group.data,
        members: members.data ?? [],
        lists: lists.data ?? [],
        invites: invites.data ?? [],
      },
    }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}

export const createGroup = (client: DatabaseClient, value: CreateGroupRecord) => client.rpc('create_group', {
  p_id: value.id,
  p_name: value.name,
  p_list_title: value.listTitle,
})

export const renameGroup = (client: DatabaseClient, value: RenameGroupInput) => client.rpc('rename_group', { p_group_id: value.groupId, p_name: value.name })

export const removeMember = (client: DatabaseClient, value: RemoveMemberInput) => client.rpc('remove_group_member', { p_group_id: value.groupId, p_member_id: value.memberId })
