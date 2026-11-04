import type { DatabaseClient, DatabaseError } from '@/types/supabase'

export type MutationOperation<Input, Output> = (
  client: DatabaseClient,
  data: Input,
) => PromiseLike<{ data: Output | null; error: DatabaseError | null }>
