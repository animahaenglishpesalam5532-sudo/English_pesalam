import React from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'

export type Blog = {
  id: string
  slug: string
  title: string
  content: string
  featured_image: string | null
  created_at: string
  authors: { name: string; profile_image: string | null } | null
}

export function BlogCard({ blog }: { blog: Blog }) {
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
