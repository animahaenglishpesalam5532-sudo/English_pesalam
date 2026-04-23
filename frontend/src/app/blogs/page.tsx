import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { User, ChevronLeft, ChevronRight } from 'lucide-react'
import { Suspense } from 'react'

function BlogGridSkeleton() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 w-full">
      {[...Array(9)].map((_, i) => (
        <div key={i} className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[400px] animate-pulse">
          <div className="flex-shrink-0 h-48 w-full bg-gray-200"></div>
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="mt-6 flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="ml-3 space-y-2 flex-col w-full">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function BlogCard({ blog }: { blog: any }) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="flex-shrink-0 relative w-full aspect-video bg-gray-200 overflow-hidden">
        <img
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          src={blog.featured_image || '/placeholder-image.png'}
          alt={blog.title || 'Blog cover image'}
        />
      </div>
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {blog.title}
          </h3>
          <p className="mt-3 text-base text-gray-500 line-clamp-3">
            {blog.content.replace(/<[^>]*>?/gm, '').substring(0, 150)}...
          </p>
        </div>
        <div className="mt-6 flex items-center">
          <div className="flex-shrink-0">
            <span className="sr-only">{blog.authors?.name}</span>
            {blog.authors?.profile_image ? (
              <img className="h-10 w-10 rounded-full object-cover" src={blog.authors.profile_image} alt="" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {blog.authors?.name || 'Unknown Author'}
            </p>
            <div className="flex space-x-1 text-sm text-gray-500">
              <span>
                {new Date(blog.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

async function FeaturedBlogs() {
  const supabase = createClient()
  const { data: blogs } = await supabase
    .from('blogs')
    .select('*, authors(name, profile_image)')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(3)

  if (!blogs || blogs.length === 0) return null

  return (
    <div className="flex flex-col space-y-8 mb-4">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Featured Blogs</h2>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  )
}

async function BlogGrid({ page }: { page: number }) {
  const itemsPerPage = 9;
  const from = (page - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  const supabase = createClient()

  const { data: blogs, count } = await supabase
    .from('blogs')
    .select('*, authors(name, profile_image)', { count: 'exact' })
    .eq('status', 'published')
    .eq('is_featured', false)
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count || 0) / itemsPerPage);

  return (
    <div className="flex flex-col space-y-12">
      {page === 1 && (
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Latest Blogs</h2>
        </div>
      )}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogs?.map((blog) => (
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
            href={page > 1 ? `/blogs?page=${page - 1}` : '#'}
            className={`p-2 rounded-lg border ${page <= 1 ? 'pointer-events-none text-gray-300 border-gray-100 bg-gray-50' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="flex space-x-1 flex-wrap justify-center">
            {[...Array(totalPages)].map((_, i) => (
              <Link
                key={i + 1}
                href={`/blogs?page=${i + 1}`}
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
            href={page < totalPages ? `/blogs?page=${page + 1}` : '#'}
            className={`p-2 rounded-lg border ${page >= totalPages ? 'pointer-events-none text-gray-300 border-gray-100 bg-gray-50' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  )
}

export default async function PublicBlogsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === 'string' ? Math.max(1, parseInt(searchParams.page)) : 1;

  return (
    <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 mt-16 text-gray-900">
      <div className="max-w-7xl mx-auto flex flex-col space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            English Pesalam Blog
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500">
            Learn English step-by-step with practical tips, lessons, and Tamil explanations.
          </p>
        </div>

        <div className="flex flex-col space-y-4">
          {page === 1 && (
            <Suspense fallback={<BlogGridSkeleton />}>
              <FeaturedBlogs />
            </Suspense>
          )}

          <Suspense key={page} fallback={<BlogGridSkeleton />}>
            <BlogGrid page={page} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
