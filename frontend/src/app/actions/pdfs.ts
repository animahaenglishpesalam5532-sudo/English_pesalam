'use server'

import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'

export async function getVisiblePDFs(useStatic: boolean = false, page: number = 0, limit: number = 30) {
  const supabase = useStatic ? createStaticClient() : await createClient()
  
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from('pdfs')
    .select('*')
    .eq('is_visible', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching PDFs:', error)
    return []
  }

  return data || []
}
