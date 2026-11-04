import type { Locale } from '@/i18n/locales'

export type GoogleProps = {
  locale: Locale
  configured: boolean
  next?: string
}
