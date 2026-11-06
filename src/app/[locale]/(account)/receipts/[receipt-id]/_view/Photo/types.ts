import type { ReceiptImage } from '@/lib/receipts/types'

export type PhotoProps = {
  image: ReceiptImage
  confidence?: number
  lines?: string[]
  index: number
  count: number
  disabled: boolean
  onMove: (image: ReceiptImage, direction: number) => void
  onRemove: (image: ReceiptImage) => void
  onRecognize: (id: string) => void
  onReplace: (image: ReceiptImage, file: File) => void
}
