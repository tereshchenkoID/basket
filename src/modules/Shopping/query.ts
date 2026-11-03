import { databaseError } from '@/lib/supabase/mutation'
import { createClient } from '@/lib/supabase/server'
import { uuid } from '@/helpers/validation'

import 'server-only'
import type { ActionResult } from '@/types/action'
import type { ShoppingItem, ShoppingList } from '@/types/database'

export type ListData = { list: ShoppingList; items: ShoppingItem[] }

export async function getList(groupId: string, listId: string): Promise<ActionResult<ListData>> {
  if (!uuid.safeParse(groupId).success || !uuid.safeParse(listId).success)
    return { ok: false, error: 'forbidden' }

  try {
    const client = await createClient()
    const list = await client
      .from('shopping_lists')
      .select('*')
      .eq('id', listId)
      .eq('group_id', groupId)
      .maybeSingle()

    if (list.error) return { ok: false, error: databaseError(list.error) }
    if (!list.data) return { ok: false, error: 'forbidden' }

    const items = await client
      .from('shopping_items')
      .select('*')
      .eq('list_id', listId)
      .is('deleted_at', null)
      .order('is_purchased')
      .order('created_at')

    if (items.error) return { ok: false, error: databaseError(items.error) }

    return { ok: true, data: { list: list.data, items: items.data } }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}
