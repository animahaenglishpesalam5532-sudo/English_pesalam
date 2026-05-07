'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Search, FileText, Download, Eye, Edit2, Trash2, ExternalLink, Image as ImageIcon, Upload, Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'react-hot-toast'
import { uploadImage } from '@/app/actions/blog'

interface PDFData {
  id: string
  name: string
  description: string
  image_url: string
  marked_price: string
  selling_price: string
  is_visible: boolean
  is_featured: boolean
  created_at: string
}

export default function PDFManager() {
  const [pdfs, setPdfs] = useState<PDFData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPDF, setSelectedPDF] = useState<PDFData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    marked_price: '',
    selling_price: '',
    is_visible: true,
    is_featured: false
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchPDFs()
  }, [currentPage, debouncedSearch])

  const fetchPDFs = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('pdfs')
        .select('*', { count: 'exact' })
      
      if (debouncedSearch) {
        query = query.or(`name.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`)
      }

      const from = (currentPage - 1) * pageSize
      const to = from + pageSize - 1

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      
      setPdfs(data || [])
      setTotalCount(count || 0)
    } catch (error: any) {
      toast.error('Failed to fetch PDFs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setIsUploading(true)
    const fd = new FormData()
    fd.append('file', file)

    try {
      const result = await uploadImage(fd, 'pdfs')
      if (result.error) throw new Error(result.error)
      if (result.url) {
        setFormData(prev => ({ ...prev, image_url: result.url }))
        toast.success('Image uploaded')
      }
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.selling_price) {
      toast.error('Name and Selling Price are required')
      return
    }

    try {
      setIsSaving(true)
      const payload = {
        ...formData,
        updated_at: new Date().toISOString()
      }

      if (isEditing && selectedPDF) {
        const { error } = await supabase
          .from('pdfs')
          .update(payload)
          .eq('id', selectedPDF.id)

        if (error) throw error
        toast.success('PDF updated successfully')
      } else {
        const { error } = await supabase
          .from('pdfs')
          .insert([payload])

        if (error) throw error
        toast.success('PDF created successfully')
      }
      
      setIsModalOpen(false)
      fetchPDFs()
      resetForm()
    } catch (error: any) {
      toast.error('Error saving: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PDF?')) return

    try {
      const { error } = await supabase
        .from('pdfs')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('PDF deleted')
      fetchPDFs()
    } catch (error: any) {
      toast.error('Error deleting: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      marked_price: '',
      selling_price: '',
      is_visible: true,
      is_featured: false
    })
    setSelectedPDF(null)
    setIsEditing(false)
  }

  const openEditModal = (pdf: PDFData) => {
    setSelectedPDF(pdf)
    setFormData({
      name: pdf.name,
      description: pdf.description,
      image_url: pdf.image_url,
      marked_price: pdf.marked_price,
      selling_price: pdf.selling_price,
      is_visible: pdf.is_visible,
      is_featured: pdf.is_featured
    })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PDF Manager</h1>
          <p className="text-gray-500">Manage Digital PDF Guides and eBooks.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add PDF Guide
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search PDFs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Pricing</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && pdfs.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-32"></div>
                        <div className="h-3 bg-gray-100 rounded w-48"></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-100 rounded-full w-16"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-100 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : pdfs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No PDFs found. Start by adding one!</p>
                  </td>
                </tr>
              ) : (
                pdfs.map((pdf) => (
                  <tr key={pdf.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {pdf.image_url ? (
                          <img src={pdf.image_url} alt={pdf.name} className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
                        ) : (
                          <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded-lg">
                            <FileText className="w-6 h-6 text-blue-400" />
                          </div>
                        )}
                        <div className="max-w-xs">
                          <div className="font-semibold text-gray-900 truncate">{pdf.name}</div>
                          <div className="text-xs text-gray-500 truncate">{pdf.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-blue-600">{pdf.selling_price}</span>
                        {pdf.marked_price && (
                          <span className="text-xs text-gray-400 line-through">{pdf.marked_price}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`w-fit px-2.5 py-0.5 rounded-full text-[10px] font-medium ${pdf.is_visible ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {pdf.is_visible ? 'Visible' : 'Hidden'}
                        </span>
                        {pdf.is_featured && (
                          <span className="w-fit px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(pdf)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pdf.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="p-2 border border-gray-300 rounded-md bg-white disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                className="p-2 border border-gray-300 rounded-md bg-white disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit PDF Guide' : 'Add New PDF Guide'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Guide Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Visibility</label>
              <div className="flex items-center gap-4 h-10">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_visible}
                    onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Visible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-amber-600">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
                  />
                  <span className="text-sm font-semibold">Featured</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-20"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Marked Price (e.g. ₹499)</label>
              <input
                type="text"
                value={formData.marked_price}
                onChange={(e) => setFormData({ ...formData, marked_price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Selling Price (e.g. ₹299)</label>
              <input
                type="text"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Guide Image</label>
            <div className="flex items-start gap-4">
              {formData.image_url ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: '' })}
                    className="absolute top-1 right-1 p-1 bg-red-100 rounded-full text-red-500 hover:bg-red-200 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : null}
              <div className="flex-1 space-y-3">
                <label className="flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 cursor-pointer hover:border-blue-500 transition-colors">
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-blue-500" /> : <Upload className="w-6 h-6 text-blue-400" />}
                  <span className="text-xs text-gray-500">{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                </label>
                <input
                  type="url"
                  placeholder="Or paste Image URL..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
              {isSaving ? 'Saving...' : isEditing ? 'Update Guide' : 'Add Guide'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
