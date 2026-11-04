import type { Locale } from '@/i18n/locales'

import type { GroupSummary, InvitePreview } from './database'
import type { GroupData, ListData } from './workspace'

export type InviteViewProps = {
  preview: InvitePreview
  token: string
}

export type ListViewProps = {
  data: ListData
  userId: string
}

export type GroupViewProps = {
  data: GroupData
  userId: string
  locale: Locale
}

export type DashboardViewProps = {
  groups: GroupSummary[]
  userId: string
  locale: Locale
}

export type HomeViewProps = {
  locale: Locale
  authenticated: boolean
  configured: boolean
}
