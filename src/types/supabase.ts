import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from './database'

export type DatabaseClient = SupabaseClient<Database>

export type DatabaseError = {
  message: string
  code?: string
}

export type MutationOperation<Input, Output> = (
  client: DatabaseClient,
  data: Input,
) => PromiseLike<{ data: Output | null; error: DatabaseError | null }>
