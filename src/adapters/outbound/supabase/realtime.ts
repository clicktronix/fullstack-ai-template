/**
 * Supabase Realtime adapter.
 *
 * Thin wrapper around Supabase Realtime subscriptions
 * so that use-cases layer does not import supabase client directly.
 */

import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/adapters/supabase/client'

type PostgresChangeCallback = () => void

/**
 * Subscribe to Postgres changes on multiple tables via a single Realtime channel.
 *
 * @param channelName - Unique channel name for the subscription
 * @param tables - List of table names to listen for changes
 * @param onTableChange - Callback invoked with the table name when a change occurs
 * @returns Object with `unsubscribe` method to clean up the channel
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
      // Unsubscribe first to properly clean up event handlers,
      // then remove channel from the client
      channel.unsubscribe()
      supabase.removeChannel(channel)
    },
  }
}
