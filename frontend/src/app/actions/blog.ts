/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { revalidatePath } from 'next/cache'
import { v2 as cloudinary } from 'cloudinary'

export async function deleteBlog(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from('blogs').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/blogs')
  revalidatePath('/admin/dashboard')
  revalidatePath('/blogs')
  revalidatePath('/', 'layout')
  return { success: true }
}

export async function getFeaturedBlogsCount(excludeId?: string) {
  const supabase = createClient()
  let query = supabase.from('blogs').select('id', { count: 'exact' }).eq('is_featured', true)
  if (excludeId) {
    query = query.neq('id', excludeId)
  }
  const { count } = await query
  return count || 0
}

export async function getPublicFeaturedBlogs() {
  const supabase = createStaticClient()
  const { data: blogs } = await supabase
    .from('blogs')
    .select('*, authors(name, profile_image)')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(3)

  return blogs || []
}

export async function getPublicLatestBlogs(limit: number = 3) {
  const supabase = createStaticClient()
  const { data: blogs } = await supabase
    .from('blogs')
    .select('*, authors(name, profile_image)')
    .eq('status', 'published')
    .eq('is_featured', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  return blogs || []
}

export async function uploadImage(formData: FormData, folder: string = 'blog') {
  const file = formData.get('file') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })

    return { url: result.secure_url }
  } catch (error: any) {
    return { error: error.message || 'Upload failed' }
  }
}

export async function saveBlog(formData: FormData, id?: string) {
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const content = formData.get('content') as string
  let featured_image = formData.get('featured_image') as string
  const author_id = formData.get('author_id') as string
  const status = formData.get('status') as string
  const is_featured = formData.get('is_featured') === 'true'
  const meta_title = (formData.get('meta_title') as string) || null
  const meta_description = (formData.get('meta_description') as string) || null

  if (!id && !featured_image) {
    const { getSetting } = await import('./settings')
    const defaultImage = await getSetting('default_featured_image')
    if (defaultImage) {
      featured_image = defaultImage
    }
  }

  const supabase = createClient()

  if (is_featured) {
    let query = supabase.from('blogs').select('id', { count: 'exact' }).eq('is_featured', true)
    if (id) {
      query = query.neq('id', id)
    }
    const { count } = await query
    if (count !== null && count >= 3) {
      return { error: 'You can only have up to 3 featured blogs. Please unfeature another blog first.' }
    }
  }

  const payload = {
    title,
    slug,
    content,
    featured_image: featured_image || null,
    author_id,
    status,
    is_featured,
    meta_title,
    meta_description,
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
  revalidatePath('/', 'layout')
  return { success: true }
}
