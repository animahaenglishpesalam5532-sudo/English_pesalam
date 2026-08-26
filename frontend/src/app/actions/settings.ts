'use server'

import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { revalidatePath } from 'next/cache'

export async function getSetting(key: string, useStatic: boolean = false) {
  const supabase = useStatic ? createStaticClient() : await createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error || !data) {
    return null
  }
  
  return data.value
}

/**
 * Batched version of `getSetting`. Fetches many keys in a SINGLE round trip
 * instead of one query per key, which matters a lot on pages that read 20+
 * settings — the serverless function and the database sit in different
 * regions, so each extra round trip costs hundreds of milliseconds.
 *
 * Pass `useStatic: true` on public pages: that path avoids `cookies()` and so
 * keeps the page eligible for ISR instead of forcing dynamic rendering.
 *
 * Missing keys are simply absent from the returned object, so callers keep
 * using the same `settings.key || 'default'` fallback style as before.
 */
export async function getSettings(
  keys: string[],
  useStatic: boolean = false
): Promise<Record<string, string>> {
  if (keys.length === 0) return {}

  const supabase = useStatic ? createStaticClient() : await createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', keys)

  if (error || !data) return {}

  return Object.fromEntries(
    data
      .filter((row) => row?.key && row?.value != null)
      .map((row) => [row.key as string, row.value as string])
  )
}

export async function setSetting(key: string, value: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('settings')
    .upsert({ 
      key, 
      value,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'key'
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/blogs')
  revalidatePath('/', 'layout')
  return { success: true }
}
