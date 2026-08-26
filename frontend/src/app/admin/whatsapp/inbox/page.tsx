import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import AccountNotActivated from '@/components/admin/AccountNotActivated'
import InboxShell from '@/components/admin/whatsapp/inbox/InboxShell'
import { getCurrentUser } from '@/lib/auth/roles'
import { getConversations } from '@/app/actions/whatsappInbox'

export const dynamic = 'force-dynamic'

export default async function WhatsAppInboxPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/admin')

  if (!user.isActive) return <AccountNotActivated email={user.email} />

  // Salespeople answer customers too; delivery has no business reading chats.
  if (user.role !== 'admin' && user.role !== 'staff') redirect('/admin/book-tracking')

  // Templates are deliberately NOT fetched here — the Graph call is slow and
  // most conversations never open the picker. TemplateSendModal loads them.
  const { rows } = await getConversations()

  return (
    <AdminLayout role={user.role} userName={user.fullName ?? user.email}>
      <InboxShell initialConversations={rows} />
    </AdminLayout>
  )
}
