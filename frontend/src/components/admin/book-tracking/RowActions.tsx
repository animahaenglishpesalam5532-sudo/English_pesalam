'use client'

import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { BookTrackingRecord } from '@/app/actions/bookTracking'

interface Props {
  row: BookTrackingRecord
  /** Admins and delivery personnel may remove records. */
  canDelete: boolean
  deleting: boolean
  onEdit: (row: BookTrackingRecord) => void
  onDelete: (row: BookTrackingRecord) => void
}

const BTN = 'shrink-0 p-2 rounded-lg transition-colors disabled:opacity-50'

/** Edit / delete buttons, shared by the desktop table and the mobile cards. */
export function RowActions({ row, canDelete, deleting, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        onClick={() => onEdit(row)}
        title="Edit"
        className={`${BTN} text-gray-500 hover:text-blue-600 hover:bg-blue-50`}
      >
        <Pencil className="w-4 h-4" />
      </button>
      {canDelete && (
        <button
          onClick={() => onDelete(row)}
          disabled={deleting}
          title="Delete"
          className={`${BTN} text-gray-500 hover:text-red-600 hover:bg-red-50`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
