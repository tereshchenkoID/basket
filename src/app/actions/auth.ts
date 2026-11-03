'use server'

import { redirect } from 'next/navigation'

import { isLocale } from '@/i18n/locales'

import { createClient } from '@/lib/supabase/server'

export async function logout(locale: string): Promise<{ error: boolean }> {
  if (!isLocale(locale)) return { error: true }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut({ scope: 'local' })

    if (error) return { error: true }
  } catch {
    return { error: true }
  }

  // Cookie mutation invalidates Router Cache; redirect triggers a fresh server render.
  redirect(`/${locale}/login`)
}
