import type { SupabaseClient } from '@supabase/supabase-js'
import type { z } from 'zod'

import { getUser } from '@/lib/auth/user'
import { createClient } from '@/lib/supabase/server'

import 'server-only'
import type { ActionError, ActionResult } from '@/types/action'
import type { Database } from '@/types/database'
export function databaseError(error: { message: string; code?: string }): ActionError {
  if (error.message.includes('invalid_invite')) return 'inviteInvalid'
  if (error.message.includes('owner_cannot_leave')) return 'ownerCannotLeave'
  if (['PGRST202', 'PGRST205', '42P01', '42883'].includes(error.code ?? '')) return 'setupRequired'
  if (error.code === '42501') return 'forbidden'
  if (['23514', '22003', '22P02', '23502'].includes(error.code ?? '')) return 'invalid'
  return 'unavailable'
}
export async function mutate<T, U>(
  schema: z.ZodType<T>,
  input: unknown,
  operation: (
    client: SupabaseClient<Database>,
    data: T,
  ) => PromiseLike<{ data: U | null; error: { message: string; code?: string } | null }>,
): Promise<ActionResult<U>> {
  if (!(await getUser())) return { ok: false, error: 'unauthorized' }
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalid' }
  try {
    const client = await createClient()
    const { data, error } = await operation(client, parsed.data)
    if (error) return { ok: false, error: databaseError(error) }
    return { ok: true, data: data as U }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}
