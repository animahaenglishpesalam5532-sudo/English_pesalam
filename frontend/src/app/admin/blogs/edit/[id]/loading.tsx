'use client'

import AdminLayout from '@/components/admin/AdminLayout'

export default function EditBlogLoading() {
  return (
    <AdminLayout>
      <div className="mb-8 skeleton-header">
        <h1 className="text-2xl font-bold text-gray-900">Edit Blog</h1>
        <p className="mt-1 text-sm text-gray-500">Loading editor...</p>
      </div>
      
      <div className="space-y-8 max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Column Skeleton */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="space-y-2 pt-2">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-96 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>

          {/* Sidebar Column Skeleton */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-32 pb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="pt-4 flex space-x-3">
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
                <div className="h-10 bg-gray-300 rounded flex-1"></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-32 pb-2"></div>
              <div className="space-y-2">
                <div className="flex justify-between mb-1">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-32 pb-2"></div>
              <div className="h-32 bg-gray-200 rounded w-full border-2 border-dashed border-gray-300"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
