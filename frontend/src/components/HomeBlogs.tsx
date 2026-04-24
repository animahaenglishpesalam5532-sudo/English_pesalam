import React from 'react'
import { getPublicFeaturedBlogs, getPublicLatestBlogs } from '@/app/actions/blog'
import { BlogCard } from './BlogCard'

export async function HomeBlogs() {
  const featuredBlogs = await getPublicFeaturedBlogs()
  const latestBlogs = await getPublicLatestBlogs(3)

  const hasFeatured = featuredBlogs && featuredBlogs.length > 0
  const hasLatest = latestBlogs && latestBlogs.length > 0

  if (!hasFeatured && !hasLatest) {
    return null
  }

  return (
    <section className="px-4 w-full max-w-7xl mx-auto mb-20 space-y-16">
      {hasFeatured && (
        <div className="flex flex-col space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Featured Blogs</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredBlogs.map((blog: any) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      )}

      {hasLatest && (
        <div className="flex flex-col space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Latest Posts</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latestBlogs.map((blog: any) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
