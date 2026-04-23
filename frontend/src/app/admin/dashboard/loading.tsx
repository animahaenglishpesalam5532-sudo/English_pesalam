'use client'

import AdminLayout from '@/components/admin/AdminLayout'

export default function DashboardLoading() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your blog and content.</p>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center animate-pulse">
            <div className="p-6 rounded-full bg-gray-200 mr-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        ))}

        {/* Quick Actions Skeleton */}
        <div className="bg-gray-200 rounded-xl shadow-sm border border-transparent p-6 flex flex-col justify-center animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-24 mb-4"></div>
          <div className="h-9 bg-gray-300 rounded w-full"></div>
        </div>
      </div>

      {/* Recent Blogs Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="h-5 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded-full w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
