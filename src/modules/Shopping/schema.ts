import { z } from 'zod'

import { normalizedText, uuid } from '@/helpers/validation'
export const units = ['pcs', 'kg', 'g', 'l', 'ml', 'pack'] as const
export const createListSchema = z.object({ id: uuid, groupId: uuid, title: normalizedText(100) })
export const updateListSchema = z
  .object({
    listId: uuid,
    title: normalizedText(100).optional(),
    status: z.enum(['active', 'archived']).optional(),
  })
  .refine((value) => value.title !== undefined || value.status !== undefined)
const fields = {
  name: normalizedText(120),
  quantity: z.number().finite().positive().max(1000000),
  unit: z.enum(units),
}
export const addItemSchema = z.object({ id: uuid, listId: uuid, ...fields })
export const editItemSchema = z.object({ itemId: uuid, ...fields })
export const purchaseItemSchema = z.object({ itemId: uuid, purchased: z.boolean() })
export const deleteItemSchema = z.object({ itemId: uuid })
