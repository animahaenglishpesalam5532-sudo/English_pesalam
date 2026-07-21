'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveAuthor(formData: FormData, id?: string) {
  const name = formData.get('name') as string
  const bio = formData.get('bio') as string
  const designation = formData.get('designation') as string
  const profile_image = formData.get('profile_image') as string
  const is_default = formData.get('is_default') === 'true'

  const supabase = await createClient()

  // If setting this author as the default, reset all other authors' is_default to false
  if (is_default) {
    await supabase.from('authors').update({ is_default: false }).not('id', 'is', null)
  }

  const payload = {
    name,
    bio,
    designation,
    profile_image,
    is_default,
  }

  let dbAction;
  if (id) {
    dbAction = supabase.from('authors').update(payload).eq('id', id).select().single()
  } else {
    dbAction = supabase.from('authors').insert(payload).select().single()
  }

  const { data, error } = await dbAction

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/authors')
  revalidatePath('/admin/blogs')
  return { success: true, author: data }
}

export async function deleteAuthor(id: string) {
  const supabase = await createClient()
  
  // Check if author has associated blogs
  const { data: blogs, error: fetchError } = await supabase
    .from('blogs')
    .select('id')
    .eq('author_id', id)
    .limit(1)

  if (fetchError) {
    return { error: 'Error validating author associations' }
  }

  if (blogs && blogs.length > 0) {
    return { error: 'Cannot delete: This author is connected to one or more blogs.' }
  }

  const { error } = await supabase.from('authors').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/authors')
  revalidatePath('/admin/blogs')
  return { success: true }
}
