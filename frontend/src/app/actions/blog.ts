'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteBlog(id: string) {
  const supabase = createClient()
  
  const { error } = await supabase.from('blogs').delete().eq('id', id)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/admin/blogs')
  revalidatePath('/admin/dashboard')
  revalidatePath('/blogs')
  return { success: true }
}

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file)

  if (uploadError) {
    return { error: uploadError.message }
  }

  const { data } = supabase.storage.from('blog-images').getPublicUrl(filePath)
  return { url: data.publicUrl }
}

export async function saveBlog(formData: FormData, id?: string) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const content = formData.get('content') as string
  const featured_image = formData.get('featured_image') as string
  const author_id = formData.get('author_id') as string
  const status = formData.get('status') as string

  const supabase = createClient()

  const payload = {
    title,
    slug,
    content,
    featured_image: featured_image || null,
    author_id,
    status,
    updated_at: new Date().toISOString()
  }

  let error;
  if (id) {
    const res = await supabase.from('blogs').update(payload).eq('id', id)
    error = res.error
  } else {
    // If saving new blog, you must not pass updated_at if not defined in your payload expectations or just rely on default.
    const res = await supabase.from('blogs').insert(payload)
    error = res.error
  }

  if (error) {
    // Handle unique constraint on slug
    if (error.code === '23505') {
      return { error: 'Slug already exists. Please choose a different one.' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/blogs')
  revalidatePath('/admin/dashboard')
  revalidatePath('/blogs')
  revalidatePath(`/blogs/${slug}`)
  revalidatePath(`/blogs/${slug}`, 'page')
  return { success: true }
}
