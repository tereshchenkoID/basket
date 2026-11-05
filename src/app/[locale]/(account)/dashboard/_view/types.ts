import type { Locale } from '@/i18n/locales'

import type { ActionResult } from '@/types/action'
import type { GroupSummary } from '@/types/database'

export type DashboardViewProps = {
  now: number
  result: ActionResult<GroupSummary[]>
  userId: string
  locale: Locale
}
