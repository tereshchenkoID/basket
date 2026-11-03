import { databaseError } from '@/lib/supabase/mutation'
import { createClient } from '@/lib/supabase/server'
import { uuid } from '@/helpers/validation'

import 'server-only'
import type { ActionResult } from '@/types/action'
import type {
  Group, GroupSummary, Invite, MemberProfile, ShoppingList 
} from '@/types/database'

export type GroupData = {
  group: Group
  members: MemberProfile[]
  lists: ShoppingList[]
  invites: Pick<Invite, 'id' | 'expires_at' | 'use_count' | 'revoked_at'>[]
}

export async function getGroups(): Promise<ActionResult<GroupSummary[]>> {
  try {
    const client = await createClient()
    const { data, error } = await client.rpc('dashboard_groups')

    return error ? { ok: false, error: databaseError(error) } : { ok: true, data }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}

export async function getGroup(groupId: string): Promise<ActionResult<GroupData>> {
  if (!uuid.safeParse(groupId).success) return { ok: false, error: 'forbidden' }

  try {
    const client = await createClient()
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
