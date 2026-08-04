'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/roles'
import { toLoginEmail, validateLoginIdentifier } from '@/lib/auth/loginIdentifier'
import { revalidatePath } from 'next/cache'

/** Roles an admin can hand out. 'staff' is the salesperson role. */
export type AssignableRole = 'staff' | 'delivery'

export interface Member {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | AssignableRole
  is_active: boolean
  created_at: string
}

export async function getMembers(): Promise<Member[]> {
  await requireAdmin()
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, is_active, created_at')
    .order('created_at', { ascending: true })
  if (error || !data) return []
  return data as Member[]
}

export async function createStaff(input: {
  email: string
  password: string
  fullName: string
  role: AssignableRole
}): Promise<{ success?: boolean; id?: string; error?: string }> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Not authorized' }
  }

  if (input.role !== 'staff' && input.role !== 'delivery') {
    return { error: 'Invalid role' }
  }

  const invalid = validateLoginIdentifier(input.email)
  if (invalid) return { error: invalid }

  // A bare username becomes username@englishpesalam.com, which is what the
  // member then signs in with.
  const email = toLoginEmail(input.email)

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  })
  if (error || !data.user) {
    return { error: error?.message ?? 'Could not create user' }
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: data.user.id,
    email,
    full_name: input.fullName?.trim(),
    role: input.role,
    is_active: true,
  })
  if (profileError) {
    // Roll back the orphaned auth user so email can be reused
    await admin.auth.admin.deleteUser(data.user.id)
    return { error: profileError.message }
  }

  revalidatePath('/admin/team')
  return { success: true, id: data.user.id }
}

export async function setMemberActive(
  id: string,
  isActive: boolean
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Not authorized' }
  }
  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)
    .neq('role', 'admin') // never disable an admin here
  if (error) return { error: error.message }
  revalidatePath('/admin/team')
  return { success: true }
}

export async function updateMemberName(
  id: string,
  fullName: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Not authorized' }
  }
  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ full_name: fullName.trim(), updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/team')
  return { success: true }
}

export async function resetMemberPassword(
  id: string,
  password: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Not authorized' }
  }
  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(id, { password })
  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteStaff(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Not authorized' }
  }
  const admin = createAdminClient()
  // Only allow deleting non-admin members, never an admin
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', id)
    .single()
  if (!profile) return { error: 'Member not found' }
  if (profile?.role === 'admin') return { error: 'Admins cannot be removed' }
  const { error } = await admin.auth.admin.deleteUser(id) // cascade removes profile row
  if (error) return { error: error.message }
  revalidatePath('/admin/team')
  return { success: true }
}
