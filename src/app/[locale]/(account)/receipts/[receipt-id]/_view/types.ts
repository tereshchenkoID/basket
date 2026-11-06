import type {
  ReceiptAdjustment, ReceiptData, ReceiptDocument, ReceiptItem 
} from '@/lib/receipts/types'
import type { Store } from '@/lib/stores/types'

import type { ActionResult } from '@/types/action'

export type EditorItem = ReceiptItem & { key: string }

export type EditorDocument = Omit<ReceiptDocument, 'items' | 'adjustments'> & { items: EditorItem[]; adjustments: (ReceiptAdjustment & { key: string })[] }

export type ReceiptViewProps = {
  result: ActionResult<ReceiptData>
  userId: string
  groups: { id: string; name: string }[]
  stores: Store[]
}
