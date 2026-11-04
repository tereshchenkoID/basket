export const LOCALES = ['en', 'ro', 'ru', 'uk'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && LOCALES.some(locale => locale === value)
}

declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale
  }
}
