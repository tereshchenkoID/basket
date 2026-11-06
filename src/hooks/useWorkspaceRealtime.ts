'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

import type { WorkspaceRealtimeProps } from './types'

import type { WorkspaceConnection } from '@/types/workspace'

export function useWorkspaceRealtime({
  userId,
  groupId,
  listId,
}: WorkspaceRealtimeProps) {
  const router = useRouter()
  const [status, setStatus] = useState<WorkspaceConnection>('connecting')

  useEffect(() => {
    const supabase = createClient()
    let disposed = false
    let connected = false
    let reconnect = false
    let pendingRefresh = false
    let timer: ReturnType<typeof setTimeout> | undefined
    // Events invalidate snapshots. Rows are always fetched through RLS, never appended from payloads.
    const refresh = () => {
      if (disposed) return

      pendingRefresh = true
      clearTimeout(timer)

      if (document.visibilityState !== 'visible') return

      timer = setTimeout(() => {
        if (disposed || document.visibilityState !== 'visible') return

        pendingRefresh = false
        router.refresh()
      }, 120)
    }
    const channel = supabase.channel(
      `workspace:${userId}:${groupId ?? 'home'}:${listId ?? 'lists'}`,
    )
    const tables = groupId
      ? [
        { table: 'group_members', filter: `user_id=eq.${userId}` },
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
    const handleStatus = (value: string) => {
      if (disposed) return
      if (value === 'SUBSCRIBED') {
        connected = true
        setStatus('live')

        if (reconnect) refresh()

        reconnect = false
      } else if (value === 'CHANNEL_ERROR' || value === 'TIMED_OUT' || value === 'CLOSED') {
        connected = false
        reconnect = true
        setStatus('offline')
      }
    }
    channel.subscribe(handleStatus)
    const handleVisible = () => {
      if (document.visibilityState === 'visible' && (pendingRefresh || !connected)) refresh()
    }
    const handleOffline = () => {
      connected = false
      reconnect = true
      setStatus('offline')
    }
    const handlePoll = () => {
      if (!connected && window.navigator?.onLine !== false) handleVisible()
    }
    // Poll only while Realtime is unavailable; a healthy subscription sends changes itself.
    const poll = setInterval(handlePoll, 30_000)
    window.addEventListener('focus', handleVisible)
    window.addEventListener('online', handleVisible)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisible)

    return () => {
      disposed = true
      clearTimeout(timer)
      clearInterval(poll)
      window.removeEventListener('focus', handleVisible)
      window.removeEventListener('online', handleVisible)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisible)
      void supabase.removeChannel(channel)
    }
  }, [groupId, listId, router, userId])

  return status
}
