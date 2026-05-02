import type { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js'
import { supabase } from '@/adapters/supabase/client'

export type AuthStateChangeCallback = (event: AuthChangeEvent, session: Session | null) => void

export function onAuthStateChange(callback: AuthStateChangeCallback): Subscription {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback)

  return subscription
}
