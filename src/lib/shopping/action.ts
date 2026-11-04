'use server'

import { mutate } from '@/lib/supabase/mutation'

import * as repository from './repository'
import {
  ADD_ITEM_SCHEMA,
  CREATE_LIST_SCHEMA,
  DELETE_ITEM_SCHEMA,
  EDIT_ITEM_SCHEMA,
  PURCHASE_ITEM_SCHEMA,
  UPDATE_LIST_SCHEMA,
} from './schema'

export async function createList(input: unknown) {
  return mutate(CREATE_LIST_SCHEMA, input, repository.createList)
}

export async function updateList(input: unknown) {
  return mutate(UPDATE_LIST_SCHEMA, input, repository.updateList)
}

export async function addItem(input: unknown) {
  return mutate(ADD_ITEM_SCHEMA, input, repository.addItem)
}

export async function editItem(input: unknown) {
  return mutate(EDIT_ITEM_SCHEMA, input, repository.editItem)
}

export async function purchaseItem(input: unknown) {
  return mutate(PURCHASE_ITEM_SCHEMA, input, repository.purchaseItem)
}

export async function deleteItem(input: unknown) {
  return mutate(DELETE_ITEM_SCHEMA, input, repository.deleteItem)
}
