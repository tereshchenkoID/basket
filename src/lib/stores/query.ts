import { cache } from 'react'

import { createClient } from '@/lib/supabase/server'

import 'server-only'

export const getStores = cache(async () => {
  try {
    const client = await createClient()
    const { data, error } = await client.from('stores').select('*').order('name')

    return { stores: data ?? [], available: !error }
  } catch {
    return { stores: [], available: false }
  }
})
