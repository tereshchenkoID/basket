// Checked against the migration by tests/database.test.ts. Regenerate from Supabase
// with `npm run db:types` after applying migrations to review schema drift.
type Table<Row> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}
type Rpc<Args, Returns> = { Args: Args; Returns: Returns }
export type Group = {
  id: string
  name: string
  created_by: string
  created_at: string
  updated_at: string
}
export type Member = {
  group_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
  removed_at: string | null
}
export type Profile = {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}
export type Invite = {
  id: string
  group_id: string
  token_hash: string
  created_by: string
  expires_at: string
  max_uses: number
  use_count: number
  revoked_at: string | null
  created_at: string
}
export type ShoppingList = {
  id: string
  group_id: string
  title: string
  created_by: string
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
}
export type ShoppingItem = {
  id: string
  list_id: string
  name: string
  quantity: number
  unit: 'pcs' | 'kg' | 'g' | 'l' | 'ml' | 'pack'
  is_purchased: boolean
  created_by: string
  purchased_by: string | null
  purchased_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}
export type GroupSummary = {
  id: string
  name: string
  member_count: number
  remaining_count: number
}
export type MemberProfile = {
  user_id: string
  display_name: string | null
  avatar_url: string | null
  role: 'owner' | 'member'
}
export type InvitePreview = { group_id: string; group_name: string; already_member: boolean }
export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>
      groups: Table<Group>
      group_members: Table<Member>
      group_invites: Table<Invite>
      shopping_lists: Table<ShoppingList>
      shopping_items: Table<ShoppingItem>
    }
    Views: { [_ in never]: never }
    Functions: {
      create_group: Rpc<{ p_id: string; p_name: string; p_list_title: string }, string>
      rename_group: Rpc<{ p_group_id: string; p_name: string }, null>
      remove_group_member: Rpc<{ p_group_id: string; p_member_id: string }, null>
      group_member_profiles: Rpc<{ p_group_id: string }, MemberProfile[]>
      create_group_invite: Rpc<{ p_group_id: string; p_token_hash: string }, string>
      revoke_group_invite: Rpc<{ p_invite_id: string }, null>
      preview_group_invite: Rpc<{ p_token: string }, InvitePreview[]>
      accept_group_invite: Rpc<{ p_token: string }, string>
      create_shopping_list: Rpc<{ p_id: string; p_group_id: string; p_title: string }, string>
      update_shopping_list: Rpc<
        { p_list_id: string; p_title?: string | null; p_status?: string | null },
        null
      >
      add_shopping_item: Rpc<
        { p_id: string; p_list_id: string; p_name: string; p_quantity: number; p_unit: string },
        string
      >
      edit_shopping_item: Rpc<
        { p_item_id: string; p_name: string; p_quantity: number; p_unit: string },
        null
      >
      set_item_purchased: Rpc<{ p_item_id: string; p_purchased: boolean }, null>
      delete_shopping_item: Rpc<{ p_item_id: string }, null>
      dashboard_groups: Rpc<Record<string, never>, GroupSummary[]>
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
