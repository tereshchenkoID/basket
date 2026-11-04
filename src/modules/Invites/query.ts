import { createClient } from '@/lib/supabase/server'

import * as repository from './repository'

import 'server-only'
import type { ActionResult } from '@/types/action'
import type { InvitePreview } from '@/types/database'

export const previewInvite = async (token: string): Promise<ActionResult<InvitePreview>> => {
  try {
    return await repository.previewInvite(await createClient(), token)
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}
