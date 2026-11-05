import { databaseError } from '@/helpers/errors'
import { UUID } from '@/helpers/validation'

import type {
  AddItemInput,
  CreateListInput,
  DeleteItemInput,
  EditItemInput,
  PurchaseItemInput,
  UpdateListInput,
} from './types'

import type { ActionResult } from '@/types/action'
import type { DatabaseClient } from '@/types/supabase'
import type { ListData } from '@/types/workspace'

export const getList = async (
  client: DatabaseClient,
  groupId: string,
  listId: string,
): Promise<ActionResult<ListData>> => {
  if (!UUID.safeParse(groupId).success || !UUID.safeParse(listId).success)
    return { ok: false, error: 'forbidden' }

  try {
    const list = await client
      .from('shopping_lists')
      .select('*')
      .eq('id', listId)
      .eq('group_id', groupId)
      .maybeSingle()

    if (list.error) return { ok: false, error: databaseError(list.error) }
    if (!list.data) return { ok: false, error: 'groupUnavailable' }

    const [group, items] = await Promise.all([
      client.from('groups').select('id, name').eq('id', groupId).maybeSingle(),
      client
        .from('shopping_items')
        .select('*')
        .eq('list_id', listId)
        .is('deleted_at', null)
        .order('is_purchased')
        .order('created_at'),
    ])

    if (group.error) return { ok: false, error: databaseError(group.error) }
    if (!group.data) return { ok: false, error: 'forbidden' }

    if (items.error) return { ok: false, error: databaseError(items.error) }

    return { ok: true, data: { group: group.data, list: list.data, items: items.data } }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}

export const createList = (client: DatabaseClient, value: CreateListInput) => client.rpc('create_shopping_list', {
  p_id: value.id,
  p_group_id: value.groupId,
  p_title: value.title,
})

export const updateList = (client: DatabaseClient, value: UpdateListInput) => client.rpc('update_shopping_list', {
  p_list_id: value.listId,
  p_title: value.title ?? null,
  p_status: value.status ?? null,
})

export const addItem = (client: DatabaseClient, value: AddItemInput) => client.rpc('add_shopping_item', {
  p_id: value.id,
  p_list_id: value.listId,
  p_name: value.name,
  p_quantity: value.quantity,
  p_unit: value.unit,
})

export const editItem = (client: DatabaseClient, value: EditItemInput) => client.rpc('edit_shopping_item', {
  p_item_id: value.itemId,
  p_name: value.name,
  p_quantity: value.quantity,
  p_unit: value.unit,
})

export const purchaseItem = (client: DatabaseClient, value: PurchaseItemInput) => client.rpc('set_item_purchased', { p_item_id: value.itemId, p_purchased: value.purchased })

export const deleteItem = (client: DatabaseClient, value: DeleteItemInput) => client.rpc('delete_shopping_item', { p_item_id: value.itemId })
