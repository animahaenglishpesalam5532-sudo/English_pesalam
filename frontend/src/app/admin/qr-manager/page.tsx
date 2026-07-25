import AdminLayout from '@/components/admin/AdminLayout'
import QRManager from '@/components/admin/QRManager'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'QR Manager | Admin Dashboard',
  description: 'Manage dynamic QR codes',
}

export default function QRManagerPage() {
  return (
    <AdminLayout>
      <QRManager />
    </AdminLayout>
  )
}
