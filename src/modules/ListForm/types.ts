import type { Store } from '@/lib/stores/types'

export type ListFormProps = {
  stores?: Store[]
  storesAvailable?: boolean
  groupId: string
  list?: { id: string; title: string; store_id?: string | null }
  onSuccess: (id: string) => void
}
