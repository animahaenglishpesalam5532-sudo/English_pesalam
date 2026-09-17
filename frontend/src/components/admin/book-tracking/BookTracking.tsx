'use client'

import React, { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Upload, Download } from 'lucide-react'
import { Pagination } from '../TableUI'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { BookTrackingFilters } from './BookTrackingFilters'
import { BookTrackingTable } from './BookTrackingTable'
import { BookTrackingCards } from './BookTrackingCards'
import { BookTrackingModal } from './BookTrackingModal'
import { BookTrackingImportModal } from './BookTrackingImportModal'
import { useBookTrackingList } from './useBookTrackingList'
import { CARD } from './styles'
import {
  createBookTracking,
  deleteBookTracking,
  updateBookTracking,
  type BookOption,
  type BookTrackingInput,
  type BookTrackingRecord,
} from '@/app/actions/bookTracking'

interface Props {
  books: BookOption[]
  /** Admins and delivery personnel get the delete action. */
  canDelete: boolean
  /** Salespersons (staff) can view but not add/import/delete records. */
  canWrite: boolean
}

export default function BookTracking({ books, canDelete, canWrite }: Props) {
  const list = useBookTrackingList()
  const [showCreate, setShowCreate] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editing, setEditing] = useState<BookTrackingRecord | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<BookTrackingRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const openCreate = () => {
    setShowCreate(true)
  }

  const downloadSample = useCallback(async () => {
    const XLSX = await import('xlsx')

    const headers = ['DATE', 'WHATSAPP ID', 'NAME', 'PHONE', 'COURIER', 'TRACKING NO', 'BOOKS']

    const notesRow = [
      '(dd/mm/yyyy)',
      '(e.g. 91XXXXXXXXXX)',
      '(Full name)',
      '(10-digit mobile)',
      '(e.g. DTDC / Indian Postal)',
      '(Tracking number)',
      'Separate multiple books with commas.\nFor per-book quantity: BookTitle * qty\n(e.g. "Book A * 1, Book B * 2")',
    ]

    const sampleRows = [
      ['17/09/2026', '919876543210', 'Ravi Kumar',   '9876543210', 'DTDC',          'DTDC123456789', 'Book A * 1, Book B * 2'],
      ['17/09/2026', '918765432109', 'Priya S',      '8765432109', 'Indian Postal', 'IP987654321IN', 'Book A * 3'],
      ['18/09/2026', '917654321098', 'Anbu Selvan',  '7654321098', 'Professional',  'PRO456789012',  'Book B * 2, Book C * 1'],
    ]

    const ws = XLSX.utils.aoa_to_sheet([headers, notesRow, ...sampleRows])
    ws['!cols'] = [
      { wch: 14 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 52 },
    ]
    const booksNoteCell = ws['G2']
    if (booksNoteCell) booksNoteCell.s = { alignment: { wrapText: true } }
    ws['!rows'] = [{ hpt: 20 }, { hpt: 60 }]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Book Tracking')
    XLSX.writeFile(wb, 'book_tracking_sample.xlsx')
  }, [])

  const handleCreate = async (values: BookTrackingInput) => {
    const res = await createBookTracking(values)
    if (res?.error) return res
    await list.reload()
  }

  const handleUpdate = async (values: BookTrackingInput) => {
    if (!editing) return
    const res = await updateBookTracking(editing.id, values)
    if (res?.error) return res
    await list.reload()
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    const res = await deleteBookTracking(confirmDelete.id)
    setDeleting(false)
    if (res?.error) return toast.error(res.error)
    setConfirmDelete(null)
    toast.success('Record deleted')
    await list.reload()
  }

  const pagination = (
    <Pagination
      page={list.page}
      pageSize={list.pageSize}
      total={list.total}
      onPage={list.setPage}
      onPageSize={list.setPageSize}
      disabled={list.loading}
    />
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Tracking</h1>
          <p className="mt-1 text-sm text-gray-500">
            Book delivery records and tracking numbers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canWrite && (
            <>
              <button
                onClick={() => setShowImport(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" /> Import Records
              </button>
              <button
                onClick={downloadSample}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" /> Sample File
              </button>
              <button
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Record
              </button>
            </>
          )}
        </div>
      </div>

      <BookTrackingFilters
        search={list.search}
        whatsappId={list.whatsappId}
        courierName={list.courierName}
        from={list.from}
        to={list.to}
        filtersActive={list.filtersActive}
        onSearch={list.setSearch}
        onWhatsappId={list.setWhatsappId}
        onCourierName={list.setCourierName}
        onFrom={list.setFrom}
        onTo={list.setTo}
        onClear={list.clearFilters}
      />

      <div className={`hidden md:block ${CARD} overflow-hidden`}>
        <BookTrackingTable
          rows={list.rows}
          loading={list.loading}
          filtersActive={list.filtersActive}
          canDelete={canDelete}
          deletingId={deleting ? (confirmDelete?.id ?? null) : null}
          sortBy={list.sortBy}
          sortOrder={list.sortOrder}
          onToggleSort={list.toggleSort}
          onEdit={setEditing}
          onDelete={setConfirmDelete}
        />
        {pagination}
      </div>

      <div className="md:hidden space-y-3">
        <BookTrackingCards
          rows={list.rows}
          loading={list.loading}
          filtersActive={list.filtersActive}
          canDelete={canDelete}
          deletingId={deleting ? (confirmDelete?.id ?? null) : null}
          onEdit={setEditing}
          onDelete={setConfirmDelete}
        />
        <div className={CARD}>{pagination}</div>
      </div>

      {showImport && (
        <BookTrackingImportModal
          books={books}
          onClose={() => setShowImport(false)}
          onImported={list.reload}
        />
      )}

      {showCreate && (
        <BookTrackingModal
          isOpen
          onClose={() => setShowCreate(false)}
          books={books}
          mode="create"
          onSubmit={handleCreate}
        />
      )}

      {editing && (
        <BookTrackingModal
          key={editing.id}
          isOpen
          onClose={() => setEditing(null)}
          books={books}
          mode="edit"
          initial={{
            whatsappId: editing.whatsapp_id,
            name: editing.name,
            phone: editing.phone,
            courierName: editing.courier_name ?? '',
            trackingNumber: editing.tracking_number,
            items: editing.items,
            createdAt: editing.created_at,
          }}
          onSubmit={handleUpdate}
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete record"
        busy={deleting}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        message={
          <>
            Delete record for{' '}
            <span className="font-semibold text-gray-900">{confirmDelete?.name}</span>? This cannot
            be undone.
          </>
        }
      />
    </div>
  )
}
