import { createClient } from '@/lib/supabase/server'

import * as repository from './repository'

import 'server-only'
import type { ActionResult } from '@/types/action'
import type { ListData } from '@/types/workspace'

export const getList = async (groupId: string, listId: string): Promise<ActionResult<ListData>> => {
  try {
    return await repository.getList(await createClient(), groupId, listId)
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}
