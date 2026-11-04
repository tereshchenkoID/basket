import type { ActionResult } from '@/types/action'
import type { ListData } from '@/types/workspace'

export type ListViewProps = {
  result: ActionResult<ListData>
  userId: string
}
