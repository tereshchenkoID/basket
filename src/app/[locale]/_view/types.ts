import type { Locale } from '@/i18n/locales'

export type HomeViewProps = {
  locale: Locale
  authenticated: boolean
  configured: boolean
}
