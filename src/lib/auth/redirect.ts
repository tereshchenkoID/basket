import { DEFAULT_LOCALE, isLocale, type Locale } from '@/i18n/locales'

import { REGEX } from '@/constant/regex'

// Only actual auth destinations are permitted. No queries, fragments, encoding or trailing slashes.
export function safeNext(value: unknown): string {
  if (typeof value !== 'string') return `/${DEFAULT_LOCALE}/dashboard`

  const match = REGEX.authDestination.exec(value)

  return match && match[0] === value && isLocale(match[1]) ? value : `/${DEFAULT_LOCALE}/dashboard`
}

export function localeFromNext(next: string): Locale {
  const value = safeNext(next).split('/')[1]

  return isLocale(value) ? value : DEFAULT_LOCALE
}

export function nextForLocale(value: unknown, locale: Locale): string {
  const next = safeNext(value)

  return `/${locale}${next.slice(3)}`
}

export function callbackUrl(origin: string, locale: unknown, next?: string): string {
  if (!isLocale(locale)) throw new Error('Invalid locale')

  const url = new URL('/auth/callback', origin)
  url.searchParams.set('next', nextForLocale(next, locale))

  return url.toString()
}
