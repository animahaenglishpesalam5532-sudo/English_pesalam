'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Search, QrCode, Download, Eye, Edit2, Trash2, ExternalLink, Copy, ChevronLeft, ChevronRight } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'react-hot-toast'

interface QRCodeData {
  id: string
  title: string
  target_url: string
  short_code: string
  created_at: string
}

export default function QRManager() {
  const [qrs, setQrs] = useState<QRCodeData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    target_url: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  const supabase = createClient()

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1) // Reset to first page on new search
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchQRs()
  }, [currentPage, debouncedSearch])

  const fetchQRs = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('qr_codes')
        .select('*', { count: 'exact' })
      
      if (debouncedSearch) {
        query = query.or(`title.ilike.%${debouncedSearch}%,target_url.ilike.%${debouncedSearch}%,short_code.ilike.%${debouncedSearch}%`)
      }

      const from = (currentPage - 1) * pageSize
      const to = from + pageSize - 1

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      
      setQrs(data || [])
      setTotalCount(count || 0)
    } catch (error: any) {
      toast.error('Failed to fetch QR codes: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.target_url) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setIsSaving(true)
      if (isEditing && selectedQR) {
        const { error } = await supabase
          .from('qr_codes')
          .update({
            title: formData.title,
            target_url: formData.target_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedQR.id)

        if (error) throw error
        toast.success('QR Code updated successfully')
      } else {
        const short_code = generateShortCode()
        const { error } = await supabase
          .from('qr_codes')
          .insert([
            {
              title: formData.title,
              target_url: formData.target_url,
              short_code: short_code
            }
          ])

        if (error) throw error
        toast.success('QR Code created successfully')
      }
      
      setIsModalOpen(false)
      fetchQRs()
      resetForm()
    } catch (error: any) {
      toast.error('Error saving QR code: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return

    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('QR Code deleted')
      
      // If we deleted the last item on the current page, go back a page
      if (qrs.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1)
      } else {
        fetchQRs()
      }
    } catch (error: any) {
      toast.error('Error deleting QR code: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({ title: '', target_url: '' })
    setSelectedQR(null)
    setIsEditing(false)
  }

  const openEditModal = (qr: QRCodeData) => {
    setSelectedQR(qr)
    setFormData({ title: qr.title, target_url: qr.target_url })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const openPreview = (qr: QRCodeData) => {
    setSelectedQR(qr)
    setIsPreviewOpen(true)
  }

  const getFullRedirectUrl = (shortCode: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/q/${shortCode}`
    }
    return `/q/${shortCode}`
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Manager</h1>
          <p className="text-gray-500">Create and manage dynamic QR codes for your links.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create QR Code
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by title, URL or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {loading && searchQuery !== debouncedSearch && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">QR Code</th>
                <th className="px-6 py-4 font-medium">Title & Target</th>
                <th className="px-6 py-4 font-medium">Short URL</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && qrs.length === 0 ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="w-12 h-12 bg-gray-100 rounded"></div></td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-48"></div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-gray-100 rounded w-24 ml-auto"></div></td>
                  </tr>
                ))
              ) : qrs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <QrCode className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No QR codes found. Create your first one!</p>
                  </td>
                </tr>
              ) : (
                qrs.map((qr) => (
                  <tr key={qr.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div 
                        className="p-2 bg-white border border-gray-100 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => openPreview(qr)}
                      >
                        <QRCodeCanvas
                          id={`qr-canvas-${qr.id}`}
                          value={getFullRedirectUrl(qr.short_code)}
                          size={48}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{qr.title}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1 truncate max-w-xs">
                        <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{qr.target_url}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit">
                        /q/{qr.short_code}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 transition-opacity">
                        <button
                          onClick={() => openPreview(qr)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="View & Download"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(qr)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(qr.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
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

        {/* Pagination Footer */}
        {totalCount > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="p-2 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                  // Basic pagination logic to show current page surroundings
                  let pageNum = currentPage
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else {
                    if (currentPage <= 3) pageNum = i + 1
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                    else pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
                className="p-2 border border-gray-300 rounded-md bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit QR Code' : 'Create New QR Code'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Identification Title</label>
            <input
              type="text"
              placeholder="e.g. Menu for Table 1"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Target Link (URL)</label>
            <input
              type="url"
              placeholder="https://example.com/your-menu"
              value={formData.target_url}
              onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : isEditing ? 'Update QR Code' : 'Generate QR Code'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="QR Code Preview"
      >
        {selectedQR && (
          <div className="flex flex-col items-center space-y-6 text-center">
            <div className="p-8 bg-white border-4 border-gray-50 rounded-2xl shadow-xl ring-1 ring-gray-100">
              <QRCodeCanvas
                id={`qr-preview-canvas`}
                value={getFullRedirectUrl(selectedQR.short_code)}
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
            
            <div className="space-y-1">
              <h4 className="text-xl font-bold text-gray-900">{selectedQR.title}</h4>
              <p className="text-sm text-gray-500 max-w-xs truncate">{selectedQR.target_url}</p>
              <div className="mt-2 inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                {getFullRedirectUrl(selectedQR.short_code)}
              </div>
            </div>

            <div className="w-full flex gap-3 pt-4">
              <button
                onClick={() => {
                  const canvas = document.getElementById('qr-preview-canvas') as HTMLCanvasElement
                  if (canvas) {
                    const pngUrl = canvas.toDataURL("image/png")
                    const downloadLink = document.createElement("a")
                    downloadLink.href = pngUrl
                    downloadLink.download = `${selectedQR.title.replace(/\s+/g, '-').toLowerCase()}-qr.png`
                    document.body.appendChild(downloadLink)
                    downloadLink.click()
                    document.body.removeChild(downloadLink)
                    toast.success('Downloaded PNG')
                  }
                }}
                className="flex-1 flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PNG
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getFullRedirectUrl(selectedQR.short_code))
                  toast.success('Link copied to clipboard')
                }}
                className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                title="Copy Link"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg text-left">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>Pro Tip:</strong> This is a dynamic QR code. You can print this now, and if you update the target URL in the admin panel later, the same printed QR will automatically point to the new destination!
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
