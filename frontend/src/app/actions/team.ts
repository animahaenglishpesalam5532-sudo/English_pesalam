'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/roles'
import { revalidatePath } from 'next/cache'

export interface Member {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'staff'
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
}): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireAdmin()
  } catch {
    return { error: 'Not authorized' }
  }

  const admin = createAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  })
  if (error || !data.user) {
    return { error: error?.message ?? 'Could not create user' }
  }

  const { error: profileError } = await admin.from('profiles').insert({
    id: data.user.id,
    email: input.email.trim().toLowerCase(),
    full_name: input.fullName.trim(),
    role: 'staff',
    is_active: true,
  })
  if (profileError) {
    // Roll back the orphaned auth user so email can be reused
    await admin.auth.admin.deleteUser(data.user.id)
    return { error: profileError.message }
  }

  revalidatePath('/admin/team')
  return { success: true }
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
    .eq('role', 'staff') // never disable an admin here
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
  // Only allow deleting staff, never an admin
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', id)
    .single()
  if (!profile || profile.role !== 'staff') {
    return { error: 'Only staff members can be removed' }
  }
  const { error } = await admin.auth.admin.deleteUser(id) // cascade removes profile row
  if (error) return { error: error.message }
  revalidatePath('/admin/team')
  return { success: true }
}
