import type { Locale } from '@/i18n/locales'

export type GroupFormProps = {
  group?: { id: string; name: string }
  locale: Locale
  onSuccess: (id: string) => void
}
