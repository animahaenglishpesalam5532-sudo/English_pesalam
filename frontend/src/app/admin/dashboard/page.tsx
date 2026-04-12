import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { FileText, Users, PlusCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  
  // Fetch stats concurrently
  const [blogsCountRes, authorsCountRes, recentBlogsRes] = await Promise.all([
    supabase.from('blogs').select('*', { count: 'exact', head: true }),
    supabase.from('authors').select('*', { count: 'exact', head: true }),
    supabase.from('blogs').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(5)
  ])

  const totalBlogs = blogsCountRes.count ?? 0
  const totalAuthors = authorsCountRes.count ?? 0
  const recentBlogs = recentBlogsRes.data ?? []

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your blog and content.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Blogs</p>
            <p className="text-3xl font-bold text-gray-900">{totalBlogs}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Authors</p>
            <p className="text-3xl font-bold text-gray-900">{totalAuthors}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-sm border border-transparent p-6 text-white flex flex-col justify-center">
          <p className="text-sm font-medium text-blue-100 mb-2">Quick Actions</p>
          <div className="space-y-2">
            <Link 
              href="/admin/blogs/create"
              className="flex items-center text-sm font-medium bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Blog
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Blogs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Recent Blogs</h3>
          <Link href="/admin/blogs" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentBlogs.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No blogs found. Create one.</div>
          ) : (
            recentBlogs.map((blog) => (
              <div key={blog.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{blog.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(blog.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {blog.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
