import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import TeamManager from '@/components/admin/TeamManager'
import { getCurrentUser } from '@/lib/auth/roles'
import { getMembers } from '@/app/actions/team'

export const dynamic = 'force-dynamic'

export default async function TeamPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin' || !user.isActive) redirect('/admin')

  const members = await getMembers()

  return (
    <AdminLayout role={user.role} userName={user.fullName ?? user.email}>
      <TeamManager initialMembers={members} />
    </AdminLayout>
  )
}
