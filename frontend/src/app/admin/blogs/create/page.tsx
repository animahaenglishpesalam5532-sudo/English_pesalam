import AdminLayout from '@/components/admin/AdminLayout'
import BlogForm from '@/components/admin/BlogForm'
import { createClient } from '@/lib/supabase/server'

export default async function CreateBlogPage() {
  const supabase = createClient()
  const { data: authors } = await supabase.from('authors').select('*').order('name')

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Blog</h1>
        <p className="mt-1 text-sm text-gray-500">Write and publish a new blog post.</p>
      </div>
      
      <BlogForm authors={authors || []} />
    </AdminLayout>
  )
}
