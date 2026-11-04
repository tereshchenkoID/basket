import type { ShoppingItem } from '@/types/database'

export type FormProps = {
  item: ShoppingItem
  onSuccess: () => void
}
