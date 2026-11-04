import type { RefObject } from 'react'

export type DismissOptions = {
  refs: readonly RefObject<HTMLElement | null>[]
  enabled: boolean
  onDismiss: (reason: 'outside' | 'escape') => void
}

export type WorkspaceRealtimeProps = {
  userId: string
  groupId?: string
  listId?: string
}
