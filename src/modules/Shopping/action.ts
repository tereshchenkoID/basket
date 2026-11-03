'use server'

import { mutate } from '@/lib/supabase/mutation'

import {
  addItemSchema,
  createListSchema,
  deleteItemSchema,
  editItemSchema,
  purchaseItemSchema,
  updateListSchema,
} from './schema'

export async function createList(input: unknown) {
  return mutate(createListSchema, input, (client, value) =>
    client.rpc('create_shopping_list', {
      p_id: value.id,
      p_group_id: value.groupId,
      p_title: value.title,
    }),
  )
}

export async function updateList(input: unknown) {
  return mutate(updateListSchema, input, (client, value) =>
    client.rpc('update_shopping_list', {
      p_list_id: value.listId,
      p_title: value.title ?? null,
      p_status: value.status ?? null,
    }),
  )
}

export async function addItem(input: unknown) {
  return mutate(addItemSchema, input, (client, value) =>
    client.rpc('add_shopping_item', {
      p_id: value.id,
      p_list_id: value.listId,
      p_name: value.name,
      p_quantity: value.quantity,
      p_unit: value.unit,
    }),
  )
}

export async function editItem(input: unknown) {
  return mutate(editItemSchema, input, (client, value) =>
    client.rpc('edit_shopping_item', {
      p_item_id: value.itemId,
      p_name: value.name,
      p_quantity: value.quantity,
      p_unit: value.unit,
    }),
  )
}

export async function purchaseItem(input: unknown) {
  return mutate(purchaseItemSchema, input, (client, value) =>
    client.rpc('set_item_purchased', { p_item_id: value.itemId, p_purchased: value.purchased }),
  )
}

export async function deleteItem(input: unknown) {
  return mutate(deleteItemSchema, input, (client, value) =>
    client.rpc('delete_shopping_item', { p_item_id: value.itemId }),
  )
}
