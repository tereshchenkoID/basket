import type { ReceiptFilters, ReceiptSummary } from '@/lib/receipts/types'
import type { Store } from '@/lib/stores/types'

import type { ActionResult } from '@/types/action'

export type HistoryViewProps = {
  filters: ReceiptFilters
  result: ActionResult<ReceiptSummary[]>
  stores: Store[]
  groups: { id: string; name: string }[]
}
