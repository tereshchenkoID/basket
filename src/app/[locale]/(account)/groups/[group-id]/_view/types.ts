import type { Locale } from '@/i18n/locales'

import type { Store } from '@/lib/stores/types'

import type { ActionResult } from '@/types/action'
import type { GroupData } from '@/types/workspace'

export type GroupViewProps = {
  stores: Store[]
  storesAvailable: boolean
  result: ActionResult<GroupData>
  userId: string
  locale: Locale
}
