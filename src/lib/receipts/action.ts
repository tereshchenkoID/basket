'use server'

import { getUser } from '@/app/actions/static'

import { mutate } from '@/lib/supabase/mutation'
import { createClient } from '@/lib/supabase/server'
import { databaseError } from '@/helpers/errors'

import { cleanupOwnedReceipt } from './cleanup'
import { safeOcrLines } from './parser'
import { getReceipt } from './query'
import {
  DELETE_DRAFT_SCHEMA, IMAGE_SCHEMA, REMOVE_IMAGE_SCHEMA, SAVE_RECEIPT_SCHEMA, SEGMENT_SCHEMA 
} from './schema'
import type { ReceiptData } from './types'

import type { ActionResult } from '@/types/action'

export async function saveReceipt(input: unknown): Promise<ActionResult<ReceiptData>> {
  if (!(await getUser())) return { ok: false, error: 'unauthorized' }

  const parsed = SAVE_RECEIPT_SCHEMA.safeParse(input)

  if (!parsed.success) return { ok: false, error: 'invalid' }

  try {
    const client = await createClient()
    const value = parsed.data
    const { error } = await client.rpc('save_receipt', { p_id: value.id, p_document: value.document, p_revision: value.revision, p_confirm: value.confirm, p_correction: value.correction })

    if (error) return { ok: false, error: databaseError(error) }
    if (value.confirm) {
      // A failed Storage request never rolls back a confirmed purchase. The queue retries it.
      try { await cleanupOwnedReceipt(client, value.id) } catch { /* Durable job remains pending. */ }
    }

    return getReceipt(value.id)
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}

export async function prepareReceiptImage(input: unknown) {
  return mutate(IMAGE_SCHEMA, input, (client, value) => client.rpc('prepare_receipt_image', { p_receipt_id: value.receiptId, p_image_id: value.imageId, p_position: value.position, p_replace_id: value.replaceId ?? null }))
}

export async function saveReceiptSegment(input: unknown) {
  return mutate(SEGMENT_SCHEMA, input, (client, value) => client.rpc('save_receipt_segment', { p_receipt_id: value.receiptId, p_image_id: value.imageId, p_lines: safeOcrLines(value.lines), p_confidence: value.confidence, p_status: value.status }))
}

export async function removeReceiptImage(input: unknown) {
  const result = await mutate(REMOVE_IMAGE_SCHEMA, input, (client, value) => client.rpc('remove_receipt_image', { p_receipt_id: value.receiptId, p_image_id: value.imageId }))

  if (result.ok) {
    const value = REMOVE_IMAGE_SCHEMA.parse(input)

    try { await cleanupOwnedReceipt(await createClient(), value.receiptId) } catch { /* Queue retries independently. */ }
  }

  return result
}

export async function loadReceipt(id: string) {
  return getReceipt(id)
}

export async function completeReceiptUpload(input: unknown) {
  return mutate(REMOVE_IMAGE_SCHEMA, input, (client, value) => client.rpc('complete_receipt_upload', { p_receipt_id: value.receiptId, p_image_id: value.imageId }))
}

export async function deleteReceiptDraft(input: unknown) {
  const result = await mutate(DELETE_DRAFT_SCHEMA, input, (client, value) => client.rpc('delete_receipt_draft', { p_id: value.id }))

  if (result.ok) {
    const { id } = DELETE_DRAFT_SCHEMA.parse(input)

    try { await cleanupOwnedReceipt(await createClient(), id) } catch { /* The durable queue retries Storage failures. */ }
  }

  return result
}
