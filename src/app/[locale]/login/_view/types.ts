import type { Locale } from '@/i18n/locales'

export type LoginViewProps = {
  locale: Locale
  next: string
  error?: 'configuration' | 'oauth'
  configured: boolean
}
