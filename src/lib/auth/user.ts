import { cache } from 'react'

import { isAuthConfigured } from '@/lib/config'
import { createClient } from '@/lib/supabase/server'

import 'server-only'

// React cache only deduplicates within this server render, never across requests.
export const getUser = cache(async () => {
  if (!isAuthConfigured()) return null

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    return error ? null : data.user
  } catch {
    return null
  }
})
