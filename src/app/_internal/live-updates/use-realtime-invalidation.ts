'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { labelKeys } from '@/modules/labels/client'
import { workItemKeys } from '@/modules/work-items/client'
import { subscribeToTableChanges } from '@/shared/client/supabase/realtime'

const TABLE_INVALIDATION_MAP: Record<string, readonly (readonly string[])[]> = {
  labels: [labelKeys.all],
  work_items: [workItemKeys.all],
}

const REALTIME_CHANNEL = 'table-changes'
const DEBOUNCE_MS = 300

/**
 * App-level composition between provider table events and capability query contracts.
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
          queryClient.invalidateQueries({ queryKey }, { cancelRefetch: false })
        }
        pendingKeys.current.clear()
      }, DEBOUNCE_MS)
    }

    const subscription = subscribeToTableChanges(
      REALTIME_CHANNEL,
      Object.keys(TABLE_INVALIDATION_MAP),
      (table) => {
        const keys = TABLE_INVALIDATION_MAP[table]
        if (keys) scheduleInvalidation(keys)
      }
    )

    return () => {
      clearTimeout(timerRef.current)
      subscription.unsubscribe()
    }
  }, [queryClient])
}
