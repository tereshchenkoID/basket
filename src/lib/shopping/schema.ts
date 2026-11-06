import { z } from 'zod'

import { VALIDATION_ERRORS } from '@/constant/errors'
import { VALIDATION_LIMITS } from '@/constant/validation'

import { normalizedText, UUID } from '@/helpers/validation'

export const UNITS = ['pcs', 'kg', 'g', 'l', 'ml', 'pack'] as const

export const CREATE_LIST_SCHEMA = z.object({ id: UUID, groupId: UUID, title: normalizedText(VALIDATION_LIMITS.listTitle), storeId: UUID.nullable().optional(), storeName: normalizedText(120).optional() })

export const UPDATE_LIST_SCHEMA = z
  .object({
    listId: UUID,
    storeId: UUID.nullable().optional(),
    storeName: normalizedText(120).optional(),
    title: normalizedText(VALIDATION_LIMITS.listTitle).optional(),
    status: z.enum(['active', 'archived']).optional(),
  })
  .refine(value => value.title !== undefined || value.status !== undefined || value.storeId !== undefined || value.storeName !== undefined)

const FIELDS = {
  name: normalizedText(VALIDATION_LIMITS.itemName),
  quantity: z
    .number({ error: VALIDATION_ERRORS.quantity })
    .finite({ error: VALIDATION_ERRORS.quantity })
    .positive({ error: VALIDATION_ERRORS.quantity })
    .max(VALIDATION_LIMITS.quantity, { error: VALIDATION_ERRORS.quantity }),
  unit: z.enum(UNITS, { error: VALIDATION_ERRORS.unit }),
}

export const ADD_ITEM_SCHEMA = z.object({ id: UUID, listId: UUID, ...FIELDS })

export const EDIT_ITEM_SCHEMA = z.object({ itemId: UUID, ...FIELDS })

export const PURCHASE_ITEM_SCHEMA = z.object({ itemId: UUID, purchased: z.boolean() })

export const DELETE_ITEM_SCHEMA = z.object({ itemId: UUID })
