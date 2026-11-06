import type {
  CleanupJob, ReceiptDocument, ReceiptImage, ReceiptItemRow, ReceiptRow, ReceiptSegment, ReceiptSummary, ReceiptWireDetail,
} from '@/lib/receipts/types'
import type { Store } from '@/lib/stores/types'

// Regenerate with `npm run db:types` after applying Supabase migrations.
type Table<Row> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}
type Rpc<Args, Returns> = { Args: Args; Returns: Returns }

export type Group = {
  deleted_at: string | null
  id: string
  name: string
  created_by: string
  created_at: string
  updated_at: string
}

export type Member = {
  revision: number
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
  store_id?: string | null
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
  created_at: string
  deleted_at: string | null
  role: 'owner' | 'member'
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
      stores: Table<Store>
      receipts: Table<ReceiptRow>
      receipt_items: Table<ReceiptItemRow>
      receipt_images: Table<ReceiptImage>
      receipt_ocr_segments: Table<ReceiptSegment>
      receipt_cleanup_jobs: Table<CleanupJob>
      profiles: Table<Profile>
      groups: Table<Group>
      group_members: Table<Member>
      group_invites: Table<Invite>
      shopping_lists: Table<ShoppingList>
      shopping_items: Table<ShoppingItem>
    }
    Views: { [_ in never]: never }
    Functions: {
      delete_receipt_draft: Rpc<{ p_id: string }, null>
      resolve_store: Rpc<{ p_name: string }, string>
      create_list_with_store: Rpc<{ p_id: string; p_group_id: string; p_title: string; p_store_id?: string | null; p_store_name?: string | null }, string>
      update_list_with_store: Rpc<{ p_list_id: string; p_title?: string | null; p_status?: string | null; p_store_id?: string | null; p_store_name?: string | null }, null>
      save_receipt: Rpc<{ p_id: string; p_document: ReceiptDocument; p_revision: number; p_confirm: boolean; p_correction: boolean }, string>
      receipt_detail: Rpc<{ p_id: string }, ReceiptWireDetail>
      receipt_history: Rpc<{ p_store_id?: string | null; p_group_id?: string | null; p_personal?: boolean; p_from?: string | null; p_until?: string | null; p_offset?: number; p_limit?: number; p_ascending?: boolean }, ReceiptSummary[]>
      complete_receipt_upload: Rpc<{ p_receipt_id: string; p_image_id: string }, null>
      prepare_receipt_image: Rpc<{ p_receipt_id: string; p_image_id: string; p_position: number; p_replace_id?: string | null }, string>
      save_receipt_segment: Rpc<{ p_receipt_id: string; p_image_id: string; p_lines: string[]; p_confidence: number; p_status: string }, null>
      remove_receipt_image: Rpc<{ p_receipt_id: string; p_image_id: string }, null>
      finish_receipt_cleanup: Rpc<{ p_job_id: string; p_success: boolean }, null>
      claim_receipt_cleanup: Rpc<Record<string, never>, CleanupJob[]>
      create_group: Rpc<{ p_id: string; p_name: string; p_list_title: string }, string>
      delete_group: Rpc<{ p_group_id: string }, null>
      restore_group: Rpc<{ p_group_id: string }, null>
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
