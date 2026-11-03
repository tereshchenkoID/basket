'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

export function useWorkspaceRealtime({
  userId,
  groupId,
  listId,
}: {
  userId: string
  groupId?: string
  listId?: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState<'connecting' | 'live' | 'offline'>('connecting')

  useEffect(() => {
    const supabase = createClient()
    let disposed = false
    let timer: ReturnType<typeof setTimeout> | undefined
    // Events invalidate snapshots. Rows are always fetched through RLS, never appended from payloads.
    const refresh = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (!disposed) router.refresh()
      }, 120)
    }
    const channel = supabase.channel(
      `workspace:${userId}:${groupId ?? 'home'}:${listId ?? 'lists'}`,
    )
    const tables = groupId
      ? [
        { table: 'group_members', filter: `group_id=eq.${groupId}` },
        { table: 'shopping_lists', filter: `group_id=eq.${groupId}` },
        { table: 'groups', filter: `id=eq.${groupId}` },
        ...(listId ? [{ table: 'shopping_items', filter: `list_id=eq.${listId}` }] : []),
      ]
      : [{ table: 'group_members', filter: `user_id=eq.${userId}` }]

    for (const table of tables) {
      for (const event of ['INSERT', 'UPDATE'] as const) {
        channel.on('postgres_changes', { event, schema: 'public', ...table }, refresh)
      }
    }
    channel.subscribe(value => {
      if (disposed) return
      if (value === 'SUBSCRIBED') {
        setStatus('live')
        refresh()
      } else if (value === 'CHANNEL_ERROR' || value === 'TIMED_OUT' || value === 'CLOSED')
        setStatus('offline')
    })
    const online = () => refresh()
    const offline = () => setStatus('offline')
    const visible = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    document.addEventListener('visibilitychange', visible)

    return () => {
      disposed = true
      clearTimeout(timer)
      window.removeEventListener('online', online)
      window.removeEventListener('offline', offline)
      document.removeEventListener('visibilitychange', visible)
      void supabase.removeChannel(channel)
    }
  }, [groupId, listId, router, userId])

  return status
}
