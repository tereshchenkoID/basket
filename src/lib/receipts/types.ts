export type ReceiptStatus = 'draft' | 'processing' | 'review' | 'confirmed' | 'failed'

export type ReceiptItem = {
  original_name: string
  display_name: string
  quantity: string
  unit: string
  unit_price: string
  line_total: string
  discount_amount: string
  needs_review: boolean
}

export type ReceiptAdjustment = { name: string; amount: string }

export type ReceiptDocument = {
  group_id: string | null
  store_id: string | null
  store_name: string
  purchased_at: string | null
  currency: string
  receipt_total: string
  items: ReceiptItem[]
  adjustments: ReceiptAdjustment[]
  accept_mismatch: boolean
  warnings: string[]
  status: ReceiptStatus
}

export type ReceiptRow = {
  id: string
  owner_id: string
  group_id: string | null
  store_id: string | null
  store_name_snapshot: string
  purchased_at: string | null
  currency: string
  receipt_total: number | null
  status: ReceiptStatus
  version: number
  has_mismatch: boolean
  discrepancy: number
  adjustments: ReceiptAdjustment[]
  warnings: string[]
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

export type ReceiptDetail = Omit<ReceiptRow, 'receipt_total' | 'discrepancy'> & { receipt_total: string | null; discrepancy: string; items: ReceiptItem[]; author_name: string | null }

export type ReceiptItemRow = Omit<ReceiptItem, 'quantity' | 'unit' | 'unit_price' | 'line_total' | 'discount_amount'> & {
  id: string
  receipt_id: string
  position: number
  quantity: number | null
  unit: string | null
  unit_price: number | null
  line_total: number | null
  discount_amount: number
  created_at: string
}

export type ReceiptWireDetail = Omit<ReceiptDetail, 'items'> & {
  items: (Omit<ReceiptItem, 'quantity' | 'unit' | 'unit_price' | 'line_total'> & { quantity: string | null; unit: string | null; unit_price: string | null; line_total: string | null })[]
}

export type ReceiptImage = {
  id: string
  receipt_id: string
  storage_path: string
  position: number
  uploaded_at: string | null
  processing_status: 'pending' | 'processing' | 'ready' | 'failed'
  created_at: string
}

export type ReceiptSegment = {
  image_id: string
  receipt_id: string
  lines: string[]
  confidence: number
  created_at: string
}

export type CleanupJob = {
  id: string
  receipt_id: string
  owner_id: string
  paths: string[]
  status: 'pending' | 'done'
  attempts: number
  next_attempt_at: string
  lease_until: string | null
  created_at: string
}

export type ReceiptSummary = Pick<ReceiptRow, 'id' | 'owner_id' | 'group_id' | 'store_id' | 'store_name_snapshot' | 'purchased_at' | 'currency'> & {
  receipt_total: string
  item_count: number
  author_name: string | null
  group_name: string | null
  total_count: number
}

export type ReceiptFilters = {
  store?: string
  group?: string
  from?: string
  until?: string
  page?: string
  sort?: string
}

export type ReceiptData = {
  receipt: ReceiptDetail
  images: ReceiptImage[]
  segments: ReceiptSegment[]
}

export type OcrResult = { lines: string[]; confidence: number }

export type OcrAdapter = {
  recognize: (image: Blob) => Promise<OcrResult>
  terminate: () => Promise<void>
}
