'use server'

import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'

export async function getVisibleVideoCourses(useStatic: boolean = false, page: number = 0, limit: number = 30) {
  const supabase = useStatic ? createStaticClient() : createClient()
  
  const from = page * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from('video_courses')
    .select('*')
    .eq('is_visible', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching video courses:', error)
    return []
  }

  return data || []
}
