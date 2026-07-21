import AdminLayout from '@/components/admin/AdminLayout'
import BlogForm from '@/components/admin/BlogForm'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [blogRes, authorsRes] = await Promise.all([
    supabase.from('blogs').select('*').eq('id', id).single(),
    supabase.from('authors').select('*').order('name')
  ])

  if (blogRes.error || !blogRes.data) {
    notFound()
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Blog</h1>
        <p className="mt-1 text-sm text-gray-500">Update your existing blog post.</p>
      </div>
      
      <BlogForm initialData={blogRes.data} authors={authorsRes.data || []} />
    </AdminLayout>
  )
}
