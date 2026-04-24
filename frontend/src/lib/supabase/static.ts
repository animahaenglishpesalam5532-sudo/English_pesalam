import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a static Supabase client using the standard supabase-js library.
 * This client does NOT use `cookies()` and therefore will NOT opt Next.js
 * into dynamic rendering. Use this exclusively for fetching public data
 * on pages that need Static Site Generation (SSG) / ISR.
 */
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
