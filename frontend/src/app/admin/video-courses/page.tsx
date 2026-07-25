import AdminLayout from '@/components/admin/AdminLayout'
import VideoCourseManager from '@/components/admin/VideoCourseManager'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Video Course Manager | Admin Dashboard',
  description: 'Manage Premium Video Courses and Masterclasses',
}

export default function VideoCourseManagerPage() {
  return (
    <AdminLayout>
      <VideoCourseManager />
    </AdminLayout>
  )
}
