'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { subscribeToTableChanges } from '@/adapters/outbound/supabase/realtime'
import { labelKeys } from '@/ui/server-state/labels/keys'
import { workItemKeys } from '@/ui/server-state/work-items/keys'

/**
 * Template-level table-to-query-key mapping for Realtime invalidation.
 *
 * The starter keeps this mapping intentionally small and focused on the
 * demo slice so teams can extend it feature-by-feature.
 */
const TABLE_INVALIDATION_MAP: Record<string, readonly (readonly string[])[]> = {
  labels: [labelKeys.all],
  work_items: [workItemKeys.all],
}

const REALTIME_CHANNEL = 'table-changes'
const DEBOUNCE_MS = 300

/**
 * Subscribe to Supabase Realtime changes and invalidate TanStack Query cache.
 *
 * Listens for INSERT/UPDATE/DELETE on key tables and invalidates all
 * related queries so other users see fresh data without manual refresh.
 *
 * Uses a single channel with multiple subscriptions (one per table).
 * Debounces invalidation to prevent cascade during bulk operations.
 */
export function useRealtimeInvalidation() {
  const queryClient = useQueryClient()
  const pendingKeys = useRef(new Set<readonly string[]>())
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    function scheduleInvalidation(keys: readonly (readonly string[])[]) {
      for (const key of keys) {
        pendingKeys.current.add(key)
      }
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        for (const queryKey of pendingKeys.current) {
          // cancelRefetch: false — если рефетч уже в полёте (например от onSettled мутации),
          // не отменять его и не запускать новый. Только пометить кеш stale.
          // Для изменений от других пользователей (нет in-flight запросов) — рефетчит нормально.
          queryClient.invalidateQueries({ queryKey }, { cancelRefetch: false })
        }
        pendingKeys.current.clear()
      }, DEBOUNCE_MS)
    }

    const tables = Object.keys(TABLE_INVALIDATION_MAP)
    const subscription = subscribeToTableChanges(REALTIME_CHANNEL, tables, (table) => {
      const keys = TABLE_INVALIDATION_MAP[table]
      if (keys) {
        scheduleInvalidation(keys)
      }
    })

    return () => {
      clearTimeout(timerRef.current)
      subscription.unsubscribe()
    }
  }, [queryClient])
}
