import type { z } from 'zod'

import type {
  ADD_ITEM_SCHEMA, CREATE_LIST_SCHEMA, DELETE_ITEM_SCHEMA, EDIT_ITEM_SCHEMA, PURCHASE_ITEM_SCHEMA, UPDATE_LIST_SCHEMA
} from './schema'

export type CreateListInput = z.output<typeof CREATE_LIST_SCHEMA>

export type UpdateListInput = z.output<typeof UPDATE_LIST_SCHEMA>

export type AddItemInput = z.output<typeof ADD_ITEM_SCHEMA>

export type EditItemInput = z.output<typeof EDIT_ITEM_SCHEMA>

export type PurchaseItemInput = z.output<typeof PURCHASE_ITEM_SCHEMA>

export type DeleteItemInput = z.output<typeof DELETE_ITEM_SCHEMA>
