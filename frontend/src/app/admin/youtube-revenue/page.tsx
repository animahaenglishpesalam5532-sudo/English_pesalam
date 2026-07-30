import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import YouTubeRevenueView from '@/components/admin/YouTubeRevenueView'
import { getCurrentUser } from '@/lib/auth/roles'
import { getYoutubeRevenue, type YoutubeRevenueFilters } from '@/app/actions/youtube-revenue'

export const dynamic = 'force-dynamic'

export default async function YouTubeRevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const sp = await searchParams
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin' || !user.isActive) redirect('/admin')

  const filters: YoutubeRevenueFilters = {
    from: sp?.from ?? '',
    to: sp?.to ?? '',
  }

  const data = await getYoutubeRevenue(filters)

  return (
    <AdminLayout role={user.role} userName={user.fullName ?? user.email}>
      <YouTubeRevenueView data={data} filters={filters} />
    </AdminLayout>
  )
}
