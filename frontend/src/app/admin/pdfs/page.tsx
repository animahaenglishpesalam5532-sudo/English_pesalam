import AdminLayout from '@/components/admin/AdminLayout'
import PDFManager from '@/components/admin/PDFManager'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PDF Manager | Admin Dashboard',
  description: 'Manage Digital PDF Guides and eBooks',
}

export default function PDFManagerPage() {
  return (
    <AdminLayout>
      <PDFManager />
    </AdminLayout>
  )
}
