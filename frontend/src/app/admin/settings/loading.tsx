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
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="mb-8">
          <SkeletonBlock className="h-8 w-48 mb-2" />
          <SkeletonBlock className="h-4 w-72" />
        </div>

        <div className="space-y-8">
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

          {/* Book Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <SkeletonBlock className="h-6 w-52" />
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SkeletonBlock className="h-4 w-24 mb-2" />
                  <SkeletonBlock className="h-10 w-full rounded-xl" />
                </div>
                <div>
                  <SkeletonBlock className="h-4 w-24 mb-2" />
                  <SkeletonBlock className="h-10 w-full rounded-xl" />
                </div>
              </div>
              <div>
                <SkeletonBlock className="h-4 w-24 mb-2" />
                <SkeletonBlock className="h-24 w-full rounded-xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SkeletonBlock className="h-4 w-28 mb-2" />
                  <SkeletonBlock className="h-10 w-full rounded-xl" />
                </div>
                <div>
                  <SkeletonBlock className="h-4 w-28 mb-2" />
                  <SkeletonBlock className="h-10 w-full rounded-xl" />
                </div>
              </div>
              <div>
                <SkeletonBlock className="h-4 w-32 mb-2" />
                <SkeletonBlock className="h-32 w-full rounded-xl border-2 border-dashed border-gray-300" />
              </div>

              {/* WhatsApp section */}
              <div className="border-t border-slate-100 pt-6">
                <SkeletonBlock className="h-4 w-40 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <SkeletonBlock className="h-4 w-32 mb-2" />
                    <SkeletonBlock className="h-3 w-56 mb-2" />
                    <SkeletonBlock className="h-10 w-full rounded-xl" />
                  </div>
                  <div>
                    <SkeletonBlock className="h-4 w-32 mb-2" />
                    <SkeletonBlock className="h-3 w-56 mb-2" />
                    <SkeletonBlock className="h-20 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <SkeletonBlock className="h-10 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
