import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { getSupabaseConfig } from '@/lib/config'

import 'server-only'
import type { Database } from '@/types/database'
export async function createClient() {
  const config = getSupabaseConfig()
  if (!config) throw new Error('Supabase is not configured')
  const store = await cookies()
  return createServerClient<Database>(config.url, config.key, {
    cookies: {
      getAll() {
        return store.getAll()
      },
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          // Server Components cannot write cookies; Proxy handles refresh before rendering.
        }
      },
    },
  })
}
