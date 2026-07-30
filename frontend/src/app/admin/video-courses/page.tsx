import AdminLayout from '@/components/admin/AdminLayout'
import VideoCourseManager from '@/components/admin/VideoCourseManager'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Online Class Manager | Admin Dashboard',
  description: 'Manage Premium Online Classes and Masterclasses',
}

export default function VideoCourseManagerPage() {
  return (
    <AdminLayout>
      <VideoCourseManager />
    </AdminLayout>
  )
}
