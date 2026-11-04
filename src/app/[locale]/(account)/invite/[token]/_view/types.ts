import type { ActionResult } from '@/types/action'
import type { InvitePreview } from '@/types/database'

export type InviteViewProps = {
  result: ActionResult<InvitePreview>
  token: string
}
