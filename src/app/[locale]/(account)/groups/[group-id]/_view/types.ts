import type { Locale } from '@/i18n/locales'

import type { ActionResult } from '@/types/action'
import type { GroupData } from '@/types/workspace'

export type GroupViewProps = {
  result: ActionResult<GroupData>
  userId: string
  locale: Locale
}
