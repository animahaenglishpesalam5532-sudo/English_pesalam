import { createClient } from '@/lib/supabase/server'

export type Role = 'admin' | 'staff'

export interface CurrentUser {
  id: string
  email: string
  fullName: string | null
  role: Role
  isActive: boolean
}

/**
 * Returns the signed-in user's profile (id, role, ...) or null if not
 * authenticated / no profile row exists.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_active')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // Authenticated but no profile yet — treat as inactive staff.
    return {
      id: user.id,
      email: user.email ?? '',
      fullName: null,
      role: 'staff',
      isActive: false,
    }
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role as Role,
    isActive: profile.is_active,
  }
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin' || !user.isActive) {
    throw new Error('Not authorized')
  }
  return user
}
