import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('qr_codes')
    .select('target_url')
    .eq('short_code', code)
    .single()

  if (error || !data) {
    return redirect('/') // Or a custom 404 page
  }

  return redirect(data.target_url)
}
