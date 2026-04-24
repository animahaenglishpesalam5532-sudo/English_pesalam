'use server'

import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { revalidatePath } from 'next/cache'

export async function getSetting(key: string, useStatic: boolean = false) {
  const supabase = useStatic ? createStaticClient() : createClient()
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

export async function setSetting(key: string, value: string) {
  const supabase = createClient()
  
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
