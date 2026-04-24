'use client'

import AdminLayout from '@/components/admin/AdminLayout'

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className ?? ''}`} />
}

function SectionCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
      <h3 className="font-semibold text-gray-900 border-b pb-2">{title}</h3>
      {children}
    </div>
  )
}

export default function SettingsLoading() {
  return (
    <AdminLayout>
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="mb-8">
          <SkeletonBlock className="h-8 w-48 mb-2" />
          <SkeletonBlock className="h-4 w-72" />
        </div>

        {/* Navigation Logo */}
        <SectionCard title="Navigation Logo">
          <SkeletonBlock className="h-4 w-20 mb-2" />
          <SkeletonBlock className="h-10 w-64 rounded-xl" />
          <SkeletonBlock className="h-10 w-full mt-4" />
        </SectionCard>

        {/* Footer Contact */}
        <SectionCard title="Footer Contact Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SkeletonBlock className="h-4 w-28 mb-2" />
              <SkeletonBlock className="h-10 w-full" />
            </div>
            <div>
              <SkeletonBlock className="h-4 w-40 mb-2" />
              <SkeletonBlock className="h-10 w-full" />
            </div>
          </div>
        </SectionCard>

        {/* Social Media */}
        <SectionCard title="Social Media Links">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Facebook', 'Twitter', 'YouTube', 'Instagram'].map((p) => (
              <div key={p}>
                <SkeletonBlock className="h-4 w-24 mb-2" />
                <SkeletonBlock className="h-10 w-full" />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Save button */}
        <div className="flex justify-end">
          <SkeletonBlock className="h-10 w-32 rounded-lg" />
        </div>

        {/* Book Manager Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
            <div>
              <SkeletonBlock className="h-6 w-52 mb-1.5" />
              <SkeletonBlock className="h-3 w-40" />
            </div>
            <SkeletonBlock className="h-9 w-28 rounded-xl" />
          </div>
          <div className="p-6 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100">
                <SkeletonBlock className="w-14 h-[72px] rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-1/3" />
                  <SkeletonBlock className="h-3 w-1/4" />
                  <SkeletonBlock className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <SkeletonBlock className="h-8 w-8 rounded-lg" />
                  <SkeletonBlock className="h-8 w-8 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
