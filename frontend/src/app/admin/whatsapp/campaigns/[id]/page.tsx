import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import AccountNotActivated from '@/components/admin/AccountNotActivated'
import { getCurrentUser } from '@/lib/auth/roles'
import { getCampaignDetail } from '@/app/actions/whatsappCampaigns'

export const dynamic = 'force-dynamic'

const CARD = 'bg-white rounded-xl shadow-sm border border-gray-100'

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await getCurrentUser()
  if (!user) redirect('/admin')

  if (!user.isActive) return <AccountNotActivated email={user.email} />

  if (user.role !== 'admin') redirect('/admin/sales-entry')

  const detail = await getCampaignDetail(id)
  if (!detail) notFound()

  const { campaign, groups, totals } = detail

  return (
    <AdminLayout role={user.role} userName={user.fullName ?? user.email}>
      <Link
        href="/admin/whatsapp/campaigns"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" /> Campaigns
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
        {campaign.description && (
          <p className="mt-1 text-sm text-gray-600">{campaign.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          {campaign.starts_on ? fmtDate(campaign.starts_on) : 'No start date'} →{' '}
          {campaign.ends_on ? fmtDate(campaign.ends_on) : 'No end date'}
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          ['Messages sent', totals.sent, 'text-emerald-700'],
          ['Failed', totals.failed, 'text-red-600'],
          ['Unique recipients', totals.recipients, 'text-gray-900'],
        ].map(([label, value, color]) => (
          <div key={label as string} className={`${CARD} p-4`}>
            <p className={`text-2xl font-bold ${color}`}>{value as number}</p>
            <p className="mt-1 text-xs text-gray-500">{label as string}</p>
          </div>
        ))}
      </div>

      <div className={`${CARD} overflow-hidden`}>
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Sends</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Date', 'Template', 'Sent', 'Failed'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                    Nothing sent under this campaign yet.
                  </td>
                </tr>
              ) : (
                groups.map((g) => (
                  <tr key={`${g.date}-${g.templateName}-${g.templateLanguage}`}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {fmtDate(g.date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {g.templateName}
                      <span className="ml-1.5 text-xs text-gray-400">{g.templateLanguage}</span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-emerald-700">
                      {g.sent}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {g.failed || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
