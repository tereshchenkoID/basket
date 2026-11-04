'use server'

import { mutate } from '@/lib/supabase/mutation'

import * as repository from './repository'
import {
  addItemSchema,
  createListSchema,
  deleteItemSchema,
  editItemSchema,
  purchaseItemSchema,
  updateListSchema,
} from './schema'

export async function createList(input: unknown) {
  return mutate(createListSchema, input, repository.createList)
}

export async function updateList(input: unknown) {
  return mutate(updateListSchema, input, repository.updateList)
}

export async function addItem(input: unknown) {
  return mutate(addItemSchema, input, repository.addItem)
}

export async function editItem(input: unknown) {
  return mutate(editItemSchema, input, repository.editItem)
}

export async function purchaseItem(input: unknown) {
  return mutate(purchaseItemSchema, input, repository.purchaseItem)
}

export async function deleteItem(input: unknown) {
  return mutate(deleteItemSchema, input, repository.deleteItem)
}
