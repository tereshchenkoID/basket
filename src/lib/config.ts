export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key || !key.startsWith('sb_publishable_')) return null

  try {
    const parsed = new URL(url)

    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null

    return { url: parsed.origin, key }
  } catch {
    return null
  }
}

export function getSiteUrl(): string {
  const value = process.env.NEXT_PUBLIC_SITE_URL

  if (!value) throw new Error('NEXT_PUBLIC_SITE_URL is required')

  const url = new URL(value)
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)

  if (
    (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('Invalid NEXT_PUBLIC_SITE_URL')
  }

  return url.origin
}

export function isAuthConfigured(): boolean {
  try {
    return Boolean(getSupabaseConfig() && getSiteUrl())
  } catch {
    return false
  }
}
