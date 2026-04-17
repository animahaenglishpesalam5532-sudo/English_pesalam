/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, User } from 'lucide-react'
import AuthorModal from '@/components/admin/AuthorModal'
import { deleteAuthor } from '@/app/actions/author'
import toast from 'react-hot-toast'
import AdminLayout from '@/components/admin/AdminLayout'
export default function AuthorsListPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [authors, setAuthors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<any>(null)
  
  // Custom delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [authorToDelete, setAuthorToDelete] = useState<{id: string, name: string} | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchAuthors()
  }, [])

  const fetchAuthors = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('authors')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (data) {
      setAuthors(data)
    }
    setIsLoading(false)
  }

  const handleOpenCreateModal = () => {
    setEditingAuthor(null)
    setIsModalOpen(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenEditModal = (author: any) => {
    setEditingAuthor(author)
    setIsModalOpen(true)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleModalSuccess = (savedAuthor: any) => {
    if (editingAuthor) {
      setAuthors(authors.map(a => a.id === savedAuthor.id ? savedAuthor : a))
    } else {
      setAuthors([savedAuthor, ...authors])
    }
  }

  const handleDeleteClick = (id: string, name: string) => {
    setAuthorToDelete({ id, name })
    setDeleteError(null)
    setIsDeleteModalOpen(true)
  }

  const executeDelete = async () => {
    if (!authorToDelete) return;
    setIsDeleting(true);
    
    const result = await deleteAuthor(authorToDelete.id);
    if (result.error) {
      if (result.error.toLowerCase().includes('connected to')) {
        setDeleteError('This author is connected to a blog and cannot be deleted.');
      } else {
        setDeleteError(result.error);
      }
    } else {
      toast.success('Author deleted successfully');
      setAuthors(authors.filter((a: any) => a.id !== authorToDelete.id));
      setIsDeleteModalOpen(false);
    }
    setIsDeleting(false);
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Authors Management</h1>
          <p className="text-sm text-gray-500 mt-1">Add, edit or delete authors for your blog.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Author
          </button>
        </div>
      </div>

      <div className="bg-white border text-gray-900 border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bio Snippet</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={`skel-auth-${i}`} className="animate-pulse bg-white">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                        <div className="ml-4">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded max-w-[12rem] w-full"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-md"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : authors.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No authors found. Create your first author!
                  </td>
                </tr>
              ) : (
                authors.map((author) => (
                  <tr key={author.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {author.profile_image ? (
                             // eslint-disable-next-line @next/next/no-img-element
                            <img className="h-10 w-10 rounded-full object-cover" src={author.profile_image} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <User className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{author.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{author.designation || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[12rem] truncate">
                      {author.bio || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleOpenEditModal(author)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(author.id, author.name)}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <AuthorModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleModalSuccess}
          initialData={editingAuthor}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && authorToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-50 rounded-full mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              
              <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete Author</h3>
              
              {deleteError ? (
                <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="text-sm text-red-600 font-medium mb-6 bg-red-50 p-3 rounded-lg border border-red-100">
                    {deleteError}
                  </p>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="w-full inline-flex justify-center rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 transition-colors"
                  >
                    Okay, Understood
                  </button>
                </div>
              ) : (
                <div className="text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="text-sm text-gray-500 mb-6">
                    Are you sure you want to delete <strong className="text-gray-900 font-semibold">{authorToDelete.name}</strong>? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      disabled={isDeleting}
                      className="flex-1 inline-flex justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={executeDelete}
                      disabled={isDeleting}
                      className="flex-1 inline-flex justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 transition-colors"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}

