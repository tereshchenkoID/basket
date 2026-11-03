import { databaseError } from '@/lib/supabase/mutation'
import { createClient } from '@/lib/supabase/server'

import { inviteToken } from './schema'

import 'server-only'
import type { ActionResult } from '@/types/action'
import type { InvitePreview } from '@/types/database'

export async function previewInvite(token: string): Promise<ActionResult<InvitePreview>> {
  if (!inviteToken.safeParse(token).success) return { ok: false, error: 'inviteInvalid' }

  try {
    const client = await createClient()
    const { data, error } = await client.rpc('preview_group_invite', { p_token: token })

    if (error) return { ok: false, error: databaseError(error) }
    if (!data?.[0]) return { ok: false, error: 'inviteInvalid' }

    return { ok: true, data: data[0] }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}
