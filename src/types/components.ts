import type { Locale } from '@/i18n/locales'

import type { Theme } from '@/types/theme'

export type AccountInfo = {
  name: string
  email: string | null
  avatar: string | null
}

export type PreferencesProps = {
  theme: Theme
  account: AccountInfo | null
  locale: Locale
}
