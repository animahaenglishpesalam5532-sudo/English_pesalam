import React from 'react'
import { ArrowLeft } from 'lucide-react'

export default function SingleBlogSkeleton() {
  return (
    <main className="flex-1 mt-14 bg-white animate-pulse">
      {/* Article Header Skeleton */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <span className="text-gray-300 font-medium inline-flex items-center text-sm">
              <ArrowLeft className="w-4 h-4 mr-2 text-gray-300" /> Back to Blogs
            </span>
          </div>
          
          <div className="h-12 sm:h-14 bg-gray-200 rounded-lg w-3/4 mb-6"></div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-3"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="flex items-center">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>


      {/* Content Area Skeleton */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-11/12"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        
        <div className="pt-8 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-11/12"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>

        {/* Author Bio Section Skeleton */}
        <div className="mt-16 pt-10 border-t border-gray-200">
          <div className="bg-gray-50 rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="w-20 h-20 rounded-full bg-gray-300 flex-shrink-0 border-4 border-white shadow-sm"></div>
            <div className="flex-1 w-full flex flex-col items-center sm:items-start space-y-3">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
