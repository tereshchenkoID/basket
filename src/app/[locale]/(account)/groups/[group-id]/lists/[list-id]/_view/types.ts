import type { Store } from '@/lib/stores/types'

import type { ActionResult } from '@/types/action'
import type { ListData } from '@/types/workspace'

export type ListViewProps = {
  stores: Store[]
  storesAvailable: boolean
  result: ActionResult<ListData>
  userId: string
}
