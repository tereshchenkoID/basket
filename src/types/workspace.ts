import type {
  Group, Invite, MemberProfile, ShoppingItem, ShoppingList
} from '@/types/database'

export type GroupData = {
  group: Group
  members: MemberProfile[]
  lists: ShoppingList[]
  invites: Pick<Invite, 'id' | 'expires_at' | 'use_count' | 'revoked_at'>[]
}

export type ListData = {
  group: Pick<Group, 'id' | 'name'>
  list: ShoppingList
  items: ShoppingItem[]
}

export type InvitationLink = {
  url: string
  id: string
}

export type WorkspaceConnection = 'connecting' | 'live' | 'offline'
