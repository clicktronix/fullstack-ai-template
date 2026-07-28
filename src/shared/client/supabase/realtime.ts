import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/shared/client/supabase/client'

/**
 * Subscribe to Postgres changes on several tables through one browser channel.
 *
 * This adapter is capability-neutral. App composition decides which tables invalidate which
 * capability-owned query keys.
 */
export function subscribeToTableChanges(
  channelName: string,
  tables: string[],
  onTableChange: (table: string) => void
): { unsubscribe: () => void } {
  let channel: RealtimeChannel = supabase.channel(channelName)

  for (const table of tables) {
    channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
      onTableChange(table)
    })
  }

  channel.subscribe()

  return {
    unsubscribe: () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    },
  }
}
