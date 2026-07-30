'use server'

import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { revalidatePath } from 'next/cache'

export interface Book {
  id: string
  title_1: string
  title_2: string | null
  description: string | null
  price: string | null
  strikethrough_price: string | null
  image_url: string | null
  whatsapp_number: string | null
  whatsapp_message: string | null
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export type BookInput = Omit<Book, 'id' | 'created_at' | 'updated_at'>

export async function getBooks(): Promise<Book[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return data as Book[]
}

export async function getVisibleBooks(useStatic: boolean = false): Promise<Book[]> {
  const supabase = useStatic ? createStaticClient() : await createClient()
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(2)

  if (error || !data) return []
  return data as Book[]
}

export async function createBook(input: BookInput): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('books').insert([input])
  if (error) return { error: error.message }

  revalidatePath('/admin/settings')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updateBook(id: string, input: Partial<BookInput>): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('books')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/settings')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteBook(id: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('books').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/settings')
  revalidatePath('/', 'layout')
  return { success: true }
}
