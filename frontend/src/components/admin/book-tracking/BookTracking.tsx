'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Upload } from 'lucide-react'
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
