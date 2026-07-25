import AdminLayout from '@/components/admin/AdminLayout'
import PPTManager from '@/components/admin/PPTManager'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PPT Manager | Admin Dashboard',
  description: 'Manage PPTs and Digital PDF Guides',
}

export default function PPTManagerPage() {
  return (
    <AdminLayout>
      <PPTManager />
    </AdminLayout>
  )
}
