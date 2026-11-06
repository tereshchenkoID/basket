import type { ReceiptItem } from '@/lib/receipts/types'

import type { EditorItem } from '../types'

export type ItemProps = {
  item: EditorItem
  index: number
  count: number
  disabled: boolean
  onChange: (key: string, item: ReceiptItem) => void
  onMove: (key: string, direction: number) => void
  onRemove: (key: string) => void
}
