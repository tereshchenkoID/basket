import type {
  Group,
  Invite,
  MemberProfile,
  ShoppingItem,
  ShoppingList,
} from './database'

export type GroupData = {
  group: Group
  members: MemberProfile[]
  lists: ShoppingList[]
  invites: Pick<Invite, 'id' | 'expires_at' | 'use_count' | 'revoked_at'>[]
}

export type ListData = { list: ShoppingList; items: ShoppingItem[] }

export type InvitationLink = {
  url: string
  id: string
}

export type WorkspaceConnection = 'connecting' | 'live' | 'offline'

export type WorkspaceRealtimeProps = {
  userId: string
  groupId?: string
  listId?: string
}
