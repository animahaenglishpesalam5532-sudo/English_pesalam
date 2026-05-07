'use client'

import React, { useState, useEffect } from 'react'
import { Users, MousePointer2, TrendingUp, Calendar, BarChart3, Loader2 } from 'lucide-react'
import { getAnalytics } from '@/app/actions/analytics'

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [trendType, setTrendType] = useState<'daily' | 'monthly'>('daily')

  useEffect(() => {
    async function load() {
      const result = await getAnalytics()
      if (result) setData(result)
      setLoading(false)
    }
    load()
  }, [])

  const getPageName = (path: string) => {
    if (path === '/') return 'Home Page'
    if (path === '/blogs') return 'All Blogs'
    if (path === '/authors') return 'Authors'
    if (path === '/pdfs') return 'PDF Guides'
    if (path === '/ppts') return 'PPT Masterclass'
    if (path === '/video-courses') return 'Video Courses'
    if (path.startsWith('/blogs/')) return `Blog: ${path.replace('/blogs/', '').replace(/-/g, ' ')}`
    return path
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Viewers Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Viewers</p>
              <h3 className="text-2xl font-bold text-gray-900">{data?.uniqueSessions || 0}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>Lifetime unique sessions</span>
          </div>
        </div>

        {/* Total Page Views Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
              <MousePointer2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Page Hits</p>
              <h3 className="text-2xl font-bold text-gray-900">{data?.totalVisits || 0}</h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500 font-medium">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>Total recorded interactions</span>
          </div>
        </div>

        {/* Avg Visits Per Day */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Daily Activity</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {data?.dailyVisits?.length > 0 
                  ? (data.totalVisits / data.dailyVisits.length).toFixed(1) 
                  : 0}
              </h3>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500 font-medium">
            <span>Average hits per active day</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-400" />
              Most Visited Pages
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Page Path</th>
                  <th className="px-6 py-4 font-medium text-right">Visits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.pathCounts?.map(([path, count]: any) => (
                  <tr key={path} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900 capitalize">
                        {getPageName(path)}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {path}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-right font-bold">{count}</td>
                  </tr>
                ))}
                {(!data?.pathCounts || data.pathCounts.length === 0) && (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-gray-400 text-sm">
                      No data available yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trends */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-400" />
              Visitor Trends
            </h3>
            <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
              <button
                onClick={() => setTrendType('daily')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  trendType === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setTrendType('monthly')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  trendType === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {(trendType === 'daily' ? data?.dailyVisits : data?.monthlyVisits)?.map(([label, count]: any) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-gray-900 font-bold">{count} visits</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (count / (data.totalVisits || 1)) * 100 * (trendType === 'daily' ? 5 : 2))}%` }}
                  />
                </div>
              </div>
            ))}
            {(!(trendType === 'daily' ? data?.dailyVisits : data?.monthlyVisits)?.length) && (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
                Waiting for {trendType} data...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
