import { createClient as createSupabaseClient } from '@supabase/supabase-js'

import { RECEIPT_STORAGE } from '@/constant/receipts'

import { getSupabaseConfig } from '@/lib/config'

import type { CleanupJob } from './types'

import 'server-only'
import type { Database } from '@/types/database'
import type { DatabaseClient } from '@/types/supabase'

export const removeReceiptFiles = async (client: DatabaseClient, jobs: CleanupJob[]) => {
  let completed = 0

  for (const job of jobs) {
    try {
      const { error } = await client.storage.from(RECEIPT_STORAGE).remove(job.paths)
      const finished = await client.rpc('finish_receipt_cleanup', { p_job_id: job.id, p_success: !error })

      if (!error && !finished.error) completed++
    } catch {
      try { await client.rpc('finish_receipt_cleanup', { p_job_id: job.id, p_success: false }) } catch { /* The lease expires so a later worker can retry. */ }
    }
  }

  return completed
}

export const cleanupOwnedReceipt = async (client: DatabaseClient, receiptId: string) => {
  const { data } = await client.from('receipt_cleanup_jobs').select('*').eq('receipt_id', receiptId).eq('status', 'pending')

  if (data?.length) await removeReceiptFiles(client, data)
}

export const runReceiptCleanup = async () => {
  const config = getSupabaseConfig()
  const key = process.env.SUPABASE_SECRET_KEY

  if (!config || !key) throw new Error('Cleanup configuration is incomplete')

  const client = createSupabaseClient<Database>(config.url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await client.rpc('claim_receipt_cleanup', {})

  if (error) throw new Error('Cleanup queue unavailable')

  return { claimed: data.length, completed: await removeReceiptFiles(client, data) }
}
