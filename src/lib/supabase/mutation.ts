import type { z } from 'zod'

import { getUser } from '@/app/actions/static'

import { createClient } from '@/lib/supabase/server'
import { databaseError } from '@/helpers/errors'
import { validationError } from '@/helpers/validation'

import type { MutationOperation } from './types'

import 'server-only'
import type { ActionResult } from '@/types/action'

export async function mutate<T, U>(
  schema: z.ZodType<T>,
  input: unknown,
  operation: MutationOperation<T, U>,
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
