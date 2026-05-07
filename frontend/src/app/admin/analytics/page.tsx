import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'
import { BarChart3 } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Website Analytics</h1>
        </div>
        <p className="text-sm text-gray-500">
          Track visitor sessions, page views, and traffic trends.
        </p>
      </div>

      <AnalyticsDashboard />
    </AdminLayout>
  )
}
