import { createStaticClient } from '@/lib/supabase/static'
import Link from 'next/link'
import { User } from 'lucide-react'
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

import { BlogCard } from '@/components/BlogCard'

import { BlogGrid } from '@/components/BlogGrid'
import type { Metadata } from 'next'

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'English Pesalam Blog - Learn English with Tamil Explanations',
  description:
    'Practical English lessons, grammar tips, and spoken-English guides explained simply in Tamil. Learn English step by step with English Pesalam.',
  alternates: { canonical: '/blogs' },
  openGraph: {
    type: 'website',
    title: 'English Pesalam Blog',
    description:
      'Practical English lessons, grammar tips, and spoken-English guides explained simply in Tamil.',
    url: '/blogs',
  },
};

async function FeaturedBlogs() {
  const supabase = createStaticClient()
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

export default async function PublicBlogsPage() {
  const page = 1;

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
