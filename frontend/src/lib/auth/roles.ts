import { createClient } from '@/lib/supabase/server'

export type Role = 'admin' | 'staff' | 'delivery'

/** Landing page for each role after login / when bounced off a forbidden route. */
export const HOME_BY_ROLE: Record<Role, string> = {
  admin: '/admin/dashboard',
  staff: '/admin/sales-entry',
  delivery: '/admin/book-tracking',
}

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

/**
 * Admins and salespeople may read and reply in the WhatsApp inbox.
 *
 * Deliberately named for the one feature it guards: every inbox action runs on
 * the service-role client, which bypasses RLS entirely, so this call is the
 * only thing standing between a logged-in user and every customer conversation.
 */
export async function requireInboxAccess(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user || !user.isActive || (user.role !== 'admin' && user.role !== 'staff')) {
    throw new Error('Not authorized')
  }
  return user
}

/** Admins and delivery people may use the book tracking module. */
export async function requireDelivery(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user || !user.isActive || (user.role !== 'admin' && user.role !== 'delivery')) {
    throw new Error('Not authorized')
  }
  return user
}

/** Admins, delivery, and salesperson (staff) may VIEW book tracking records. */
export async function requireDeliveryOrStaff(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (
    !user ||
    !user.isActive ||
    (user.role !== 'admin' && user.role !== 'delivery' && user.role !== 'staff')
  ) {
    throw new Error('Not authorized')
  }
  return user
}
