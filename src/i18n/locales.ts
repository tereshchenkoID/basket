export const locales = ['en', 'ro', 'ru', 'uk'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && locales.some(locale => locale === value)
}
