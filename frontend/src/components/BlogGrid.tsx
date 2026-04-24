import React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BlogCard } from './BlogCard'
import { createStaticClient } from '@/lib/supabase/static'

export async function BlogGrid({ page }: { page: number }) {
  const itemsPerPage = 9;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const supabase = createStaticClient()

  const { data: blogs, count } = await supabase
    .from('blogs')
    .select('*, authors(name, profile_image)', { count: 'exact' })
    .eq('status', 'published')
    .eq('is_featured', false)
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count || 0) / itemsPerPage);

  const getPageUrl = (p: number) => {
    if (p <= 1) return '/blogs'
    return `/blogs/p/${p}`
  }

  return (
    <div className="flex flex-col space-y-12">
      {page === 1 && (
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Latest Blogs</h2>
        </div>
      )}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogs?.map((blog: any) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
        {(!blogs || blogs.length === 0) && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No blogs published yet. Please check back later.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-8">
          <Link
            href={page > 1 ? getPageUrl(page - 1) : '#'}
            className={`p-2 rounded-lg border ${page <= 1 ? 'pointer-events-none text-gray-300 border-gray-100 bg-gray-50' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="flex space-x-1 flex-wrap justify-center">
            {[...Array(totalPages)].map((_, i) => (
              <Link
                key={i + 1}
                href={getPageUrl(i + 1)}
                className={`min-w-[40px] h-10 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${page === i + 1
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'
                  }`}
              >
                {i + 1}
              </Link>
            ))}
          </div>

          <Link
            href={page < totalPages ? getPageUrl(page + 1) : '#'}
            className={`p-2 rounded-lg border ${page >= totalPages ? 'pointer-events-none text-gray-300 border-gray-100 bg-gray-50' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  )
}
