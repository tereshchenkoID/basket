import { RECEIPT_LIMITS } from '@/constant/receipts'

import { createClient } from '@/lib/supabase/server'
import { databaseError } from '@/helpers/errors'
import { UUID } from '@/helpers/validation'

import type {
  ReceiptData, ReceiptDetail, ReceiptFilters, ReceiptSummary 
} from './types'

import 'server-only'
import type { ActionResult } from '@/types/action'

export const getReceipt = async (id: string): Promise<ActionResult<ReceiptData>> => {
  if (!UUID.safeParse(id).success) return { ok: false, error: 'invalid' }

  try {
    const client = await createClient()
    const [receipt, images, segments] = await Promise.all([
      client.rpc('receipt_detail', { p_id: id }),
      client.from('receipt_images').select('*').eq('receipt_id', id).order('position').order('id'),
      client.from('receipt_ocr_segments').select('*').eq('receipt_id', id),
    ])
    const error = receipt.error ?? images.error ?? segments.error

    if (error) return { ok: false, error: databaseError(error) }

    const source = receipt.data!
    const detail: ReceiptDetail = {
      ...source,
      items: source.items.map(item => ({
        original_name: item.original_name,
        display_name: item.display_name,
        quantity: item.quantity ?? '',
        unit: item.unit ?? '',
        unit_price: item.unit_price ?? '',
        line_total: item.line_total ?? '',
        discount_amount: item.discount_amount ?? '0.00',
        needs_review: item.needs_review,
      })),
    }

    return { ok: true, data: { receipt: detail, images: images.data ?? [], segments: segments.data ?? [] } }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}

export const getReceiptHistory = async (filters: ReceiptFilters): Promise<ActionResult<ReceiptSummary[]>> => {
  const validDate = (value?: string) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value ? value : null
  const from = validDate(filters.from)
  const until = validDate(filters.until)
  const page = Math.max(1, Math.min(10000, Number.parseInt(filters.page ?? '', 10) || 1))

  try {
    const client = await createClient()
    const { data, error } = await client.rpc('receipt_history', {
      p_store_id: UUID.safeParse(filters.store).success ? filters.store : null,
      p_group_id: UUID.safeParse(filters.group).success ? filters.group : null,
      p_personal: filters.group === 'personal',
      p_from: from,
      p_until: until,
      p_offset: (page - 1) * RECEIPT_LIMITS.page,
      p_limit: RECEIPT_LIMITS.page,
      p_ascending: filters.sort === 'oldest',
    })

    return error ? { ok: false, error: databaseError(error) } : { ok: true, data: data ?? [] }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}

export const getReceiptDrafts = async () => {
  try {
    const client = await createClient()
    const { data: { user } } = await client.auth.getUser()

    if (!user) return []

    const { data } = await client.from('receipts').select('id, updated_at, status').eq('owner_id', user.id).neq('status', 'confirmed').order('updated_at', { ascending: false }).limit(25)

    return data ?? []
  } catch {
    return []
  }
}
