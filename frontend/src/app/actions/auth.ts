'use server'

import { createClient } from '@/lib/supabase/server'
import { HOME_BY_ROLE, type Role } from '@/lib/auth/roles'
import { toLoginEmail } from '@/lib/auth/loginIdentifier'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const identifier = (formData.get('email') as string)?.trim() ?? ''
  const password = formData.get('password') as string
  const supabase = await createClient()

  // Staff log in with a bare username (e.g. "salesperson"); map it to the
  // internal login email. Admins keep using their full email address.
  const email = toLoginEmail(identifier)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Invalid login credentials' }
  }

  // Route by role: each role lands on its own home screen
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', data.user.id)
    .single()

  const role = profile?.is_active ? (profile.role as Role) : null
  redirect(role ? HOME_BY_ROLE[role] : '/admin/sales-entry')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin')
}

export async function resetPassword(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reset-password`,
  })
  if (error) {
    return { error: error.message }
  }
  return { success: true }
}
