import type { SupabaseClient } from '@supabase/supabase-js'
import type { z } from 'zod'

import { databaseErrorCodes, databaseErrorMessages } from '@/constant/errors'

import { getUser } from '@/lib/auth/user'
import { createClient } from '@/lib/supabase/server'
import { validationError } from '@/helpers/validation'

import 'server-only'
import type { ActionError, ActionResult } from '@/types/action'
import type { Database } from '@/types/database'

export const databaseError = (error: { message: string; code?: string }): ActionError => {
  const message = Object.entries(databaseErrorMessages)
    .find(([value]) => error.message.includes(value))?.[1]
  const code = Object.entries(databaseErrorCodes)
    .find(([value]) => value === error.code)?.[1]

  return message ?? code ?? 'unavailable'
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

  if (!parsed.success) return { ok: false, error: validationError(parsed.error) }

  try {
    const client = await createClient()
    const { data, error } = await operation(client, parsed.data)

    if (error) return { ok: false, error: databaseError(error) }

    return { ok: true, data: data as U }
  } catch {
    return { ok: false, error: 'unavailable' }
  }
}
