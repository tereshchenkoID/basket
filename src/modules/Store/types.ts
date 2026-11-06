import type { Store as StoreRow } from '@/lib/stores/types'

export type StoreProps = {
  stores: StoreRow[]
  value?: string | null
  disabled?: boolean
}
