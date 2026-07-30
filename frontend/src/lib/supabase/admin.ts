import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client. BYPASSES Row Level Security.
 * NEVER import this into client components — server-only.
 * Used for privileged admin operations such as creating staff auth users.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
