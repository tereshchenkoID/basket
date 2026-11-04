import { createClient } from '@/lib/supabase/server'

import * as repository from './repository'

import 'server-only'
import type { ActionResult } from '@/types/action'
import type { GroupSummary } from '@/types/database'
import type { GroupData } from '@/types/workspace'

export const getGroups = async (): Promise<ActionResult<GroupSummary[]>> => {
  try {
    return await repository.getGroups(await createClient())
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}

export const getGroup = async (groupId: string): Promise<ActionResult<GroupData>> => {
  try {
    return await repository.getGroup(await createClient(), groupId)
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}
