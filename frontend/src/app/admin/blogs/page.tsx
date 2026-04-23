'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PlusCircle, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { deleteBlog, uploadImage } from '@/app/actions/blog'
import { getSetting, setSetting } from '@/app/actions/settings'
import { Modal } from '@/components/ui/Modal'

export default function BlogListPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [blogs, setBlogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const [isDefaultImageModalOpen, setIsDefaultImageModalOpen] = useState(false)
  const [defaultImage, setDefaultImage] = useState<string | null>(null)
  const [isUploadingDefault, setIsUploadingDefault] = useState(false)
  const [defaultImageUrlInput, setDefaultImageUrlInput] = useState('')

  const fetchBlogs = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('blogs')
      .select('*, authors(name)')
      .order('created_at', { ascending: false })

    if (data) {
      setBlogs(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchBlogs()
    const fetchSettings = async () => {
      const img = await getSetting('default_featured_image')
      setDefaultImage(img)
      setDefaultImageUrlInput(img || '')
    }
    fetchSettings()
  }, [])

  const handleDefaultImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingDefault(true)
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadImage(formData)
    if (result.error) {
      toast.error(result.error)
    } else if (result.url) {
      setDefaultImageUrlInput(result.url)
      toast.success('Image uploaded successfully')
    }
    setIsUploadingDefault(false)
  }

  const saveDefaultImage = async () => {
    const result = await setSetting('default_featured_image', defaultImageUrlInput)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Default image updated successfully')
      setDefaultImage(defaultImageUrlInput)
      setIsDefaultImageModalOpen(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    const result = await deleteBlog(deleteId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Blog deleted successfully')
      setBlogs(blogs.filter(b => b.id !== deleteId))
    }
    setIsDeleting(false)
    setDeleteId(null)
  }

  const filteredBlogs = blogs.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your blog posts.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsDefaultImageModalOpen(true)}
            className="group flex items-center bg-blue-50 border border-blue-200 rounded-lg shadow-sm py-2 px-4 justify-center text-sm font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <ImageIcon className="mr-2 h-4 w-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
            {defaultImage ? 'Update Default Featured Image' : 'Upload Default Featured Image'}
          </button>
          <Link
            href="/admin/blogs/create"
            className="flex items-center bg-blue-600 border border-transparent rounded-lg shadow-sm py-2 px-4 justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Blog
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div className="relative rounded-md max-w-sm w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-2 border"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={`skel-${i}`} className="animate-pulse bg-white">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-3">
                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : currentBlogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No blogs found.</td>
                </tr>
              ) : (
                currentBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                      <div className="text-sm text-gray-500">{blog.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{blog.authors?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(blog.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <Link href={`/blogs/${blog.slug}`} target="_blank" className="text-gray-500 hover:text-gray-700 transition-colors inline-block">
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link href={`/admin/blogs/edit/${blog.id}`} className="text-blue-600 hover:text-blue-900 transition-colors inline-block">
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button onClick={() => setDeleteId(blog.id)} className="text-red-600 hover:text-red-900 transition-colors inline-block">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="bg-white px-4 py-4 border-t border-gray-200 flex items-center justify-between sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredBlogs.length)}</span> of <span className="font-medium">{filteredBlogs.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex flex-wrap justify-center gap-1.5" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center justify-center h-10 min-w-[40px] rounded-lg border text-sm font-medium transition-colors ${
                        currentPage === i + 1
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Blog">
        <div>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this blog? This action cannot be undone.
          </p>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={() => setDeleteId(null)}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDefaultImageModalOpen} onClose={() => setIsDefaultImageModalOpen(false)} title="Default Featured Image">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            This image will automatically be used for new blogs if no featured image is provided.
          </p>

          <div className="space-y-3">
            {defaultImageUrlInput ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-200 group w-full h-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={defaultImageUrlInput} alt="Default Featured" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setDefaultImageUrlInput('')}
                  className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur rounded-full text-red-600 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                {isUploadingDefault ? (
                  <div className="w-8 h-8 rounded-full border-2 border-b-transparent border-blue-500 animate-spin mb-2" />
                ) : (
                  <PlusCircle className="w-8 h-8 text-gray-400 mb-2" />
                )}
                <div className="text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-transparent font-medium text-blue-600 outline-none hover:text-blue-500">
                    <span>Upload image</span>
                    <input type="file" className="sr-only" onChange={handleDefaultImageUpload} accept="image/*" disabled={isUploadingDefault} />
                  </label>
                </div>
              </div>
            )}

            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-2">Or URL:</span>
              <input
                type="url"
                value={defaultImageUrlInput}
                onChange={(e) => setDefaultImageUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              onClick={saveDefaultImage}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
            >
              Save Default Image
            </button>
            <button
              onClick={() => setIsDefaultImageModalOpen(false)}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
