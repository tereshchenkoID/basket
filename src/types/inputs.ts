import type { z } from 'zod'

import type { createGroupSchema, removeMemberSchema, renameGroupSchema } from '@/modules/Groups/schema'
import type { acceptInviteSchema, createInviteSchema, revokeInviteSchema } from '@/modules/Invites/schema'
import type {
  addItemSchema,
  createListSchema,
  deleteItemSchema,
  editItemSchema,
  purchaseItemSchema,
  updateListSchema,
} from '@/modules/Shopping/schema'

export type CreateGroupRecord = Pick<z.output<typeof createGroupSchema>, 'id' | 'name'> & {
  listTitle: string
}

export type RenameGroupInput = z.output<typeof renameGroupSchema>

export type RemoveMemberInput = z.output<typeof removeMemberSchema>

export type CreateInviteRecord = Pick<z.output<typeof createInviteSchema>, 'groupId'> & {
  tokenHash: string
}

export type AcceptInviteInput = z.output<typeof acceptInviteSchema>

export type RevokeInviteInput = z.output<typeof revokeInviteSchema>

export type CreateListInput = z.output<typeof createListSchema>

export type UpdateListInput = z.output<typeof updateListSchema>

export type AddItemInput = z.output<typeof addItemSchema>

export type EditItemInput = z.output<typeof editItemSchema>

export type PurchaseItemInput = z.output<typeof purchaseItemSchema>

export type DeleteItemInput = z.output<typeof deleteItemSchema>
