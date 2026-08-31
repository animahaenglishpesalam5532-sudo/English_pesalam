'use server'

import { requireAdmin } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  AUTO_REPLY_DEFAULT,
  AUTO_REPLY_MAX_LENGTH,
  AUTO_REPLY_SETTING_KEY,
} from '@/lib/whatsapp/autoReply'

export interface AutoReplySettings {
  message: string
  /** True when no row has been saved yet, i.e. the fallback is what goes out. */
  isDefault: boolean
  updatedAt: string | null
}

export async function getAutoReplySettings(): Promise<AutoReplySettings> {
  await requireAdmin()

  const supabase = createAdminClient()
  const { data } = await supabase
    .from('settings')
    .select('value, updated_at')
    .eq('key', AUTO_REPLY_SETTING_KEY)
    .maybeSingle()

  const stored = data?.value?.trim()

  return {
    message: stored || AUTO_REPLY_DEFAULT,
    isDefault: !stored,
    updatedAt: data?.updated_at ?? null,
  }
}

export async function saveAutoReplyMessage(
  message: string
): Promise<{ success?: true; error?: string }> {
  await requireAdmin()

  // Re-checked here rather than trusting the form: a blank or oversized value
  // would make every auto-reply fail at Meta, long after the edit.
  const trimmed = message?.trim() ?? ''
  if (!trimmed) return { error: 'Message cannot be empty' }
  if (trimmed.length > AUTO_REPLY_MAX_LENGTH) {
    return { error: `Message must be ${AUTO_REPLY_MAX_LENGTH} characters or fewer` }
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('settings')
    .upsert(
      { key: AUTO_REPLY_SETTING_KEY, value: trimmed, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )

  if (error) return { error: error.message }

  // No revalidatePath: the webhook reads this straight from the database on
  // every send, so there is no cached copy anywhere to invalidate.
  return { success: true }
}
