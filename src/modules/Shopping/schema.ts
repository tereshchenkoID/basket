import { z } from 'zod'

import { validationErrors } from '@/constant/errors'
import { validationLimits } from '@/constant/validation'

import { normalizedText, uuid } from '@/helpers/validation'

export const units = ['pcs', 'kg', 'g', 'l', 'ml', 'pack'] as const

export const createListSchema = z.object({ id: uuid, groupId: uuid, title: normalizedText(validationLimits.listTitle) })

export const updateListSchema = z
  .object({
    listId: uuid,
    title: normalizedText(validationLimits.listTitle).optional(),
    status: z.enum(['active', 'archived']).optional(),
  })
  .refine(value => value.title !== undefined || value.status !== undefined)

const fields = {
  name: normalizedText(validationLimits.itemName),
  quantity: z
    .number({ error: validationErrors.quantity })
    .finite({ error: validationErrors.quantity })
    .positive({ error: validationErrors.quantity })
    .max(validationLimits.quantity, { error: validationErrors.quantity }),
  unit: z.enum(units, { error: validationErrors.unit }),
}

export const addItemSchema = z.object({ id: uuid, listId: uuid, ...fields })

export const editItemSchema = z.object({ itemId: uuid, ...fields })

export const purchaseItemSchema = z.object({ itemId: uuid, purchased: z.boolean() })

export const deleteItemSchema = z.object({ itemId: uuid })
