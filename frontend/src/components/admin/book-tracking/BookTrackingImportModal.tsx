'use client'

import React, { useCallback, useRef, useState } from 'react'
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Pencil,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { BookTrackingImportEditModal } from './BookTrackingImportEditModal'
import { bulkImportBookTracking } from '@/app/actions/bookTracking'
import type { BookOption } from '@/app/actions/bookTracking'
import type { ImportRow } from '@/lib/bookTracking/importParser'

interface Props {
  books: BookOption[]
  onClose: () => void
  /** Called after a successful import so the parent can reload its list. */
  onImported: () => void
}


export function BookTrackingImportModal({ books, onClose, onImported }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [parseLoading, setParseLoading] = useState(false)
  const [rows, setRows] = useState<ImportRow[]>([])
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [importing, setImporting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── file handling ──────────────────────────────────────────────────────────

  const processFile = useCallback(
    async (f: File) => {
      setFile(f)
      setParseLoading(true)
      setRows([])
      try {
        const buffer = await f.arrayBuffer()
        // Dynamic import keeps xlsx out of the initial bundle
        const { parseImportFile } = await import('@/lib/bookTracking/importParser')
        const parsed = parseImportFile(buffer, books)
        if (parsed.length === 0) {
          toast.error(
            'No data found. Make sure the file has the correct column headers (DATE, WHATSAPP ID, NAME, PHONE, TRACKING NO, BOOKS).'
          )
        }
        setRows(parsed)
      } catch (err) {
        console.error(err)
        toast.error('Failed to parse file. Please check the format.')
      }
      setParseLoading(false)
    },
    [books]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const f = e.dataTransfer.files[0]
      if (f) processFile(f)
    },
    [processFile]
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  // ── row editing ────────────────────────────────────────────────────────────

  const handleSaveRow = (index: number, updated: ImportRow) => {
    setRows((prev) => prev.map((r, i) => (i === index ? updated : r)))
  }

  // ── import ─────────────────────────────────────────────────────────────────

  const importableRows = rows.filter((r) => r.errors.length === 0)
  const errorCount = rows.filter((r) => r.errors.length > 0).length

  const handleImport = async () => {
    if (!importableRows.length) return
    setImporting(true)

    const inputs = importableRows.map((r) => ({
      whatsappId: r.whatsappId,
      name: r.name,
      phone: r.phone,
      courierName: r.courier || null,
      trackingNumber: r.trackingNo,
      items: r.items,
      createdAt: r.date,
    }))

    const res = await bulkImportBookTracking(inputs)
    setImporting(false)

    if (res?.error) {
      toast.error(res.error)
      return
    }

    const imported = res.imported ?? 0
    const skipped = res.skipped ?? 0
    toast.success(
      imported === 0
        ? `All ${skipped} record${skipped !== 1 ? 's' : ''} already exist — nothing imported.`
        : skipped
        ? `${imported} imported, ${skipped} skipped (already exist).`
        : `${imported} record${imported !== 1 ? 's' : ''} imported successfully!`
    )
    onImported()
    onClose()
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop – not clickable (stays open) */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Import Records</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload an Excel or CSV file to bulk-import delivery records
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* File upload area */}
          <div className="p-6 border-b border-gray-100">
            {file ? (
              /* Compact file chip after upload */
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-xl">
                <FileSpreadsheet className="w-5 h-5 text-white shrink-0" />
                <span className="text-sm font-medium text-white flex-1 truncate">{file.name}</span>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="text-xs font-semibold text-blue-200 hover:text-white shrink-0 transition-colors"
                >
                  Change
                </button>
              </div>
            ) : (
              /* Drop zone */
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all select-none ${dragOver
                    ? 'border-blue-400 bg-blue-50 scale-[1.01]'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                  }`}
              >
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-base font-semibold text-gray-700 mb-1">
                  Drop your file here or{' '}
                  <span className="text-blue-600">browse</span>
                </p>
                <p className="text-sm text-gray-500">Supports .xlsx, .xls, .csv</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          {/* Parsing spinner */}
          {parseLoading && (
            <div className="flex items-center justify-center gap-2.5 py-16 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-sm font-medium">Parsing file…</span>
            </div>
          )}

          {/* Preview table */}
          {!parseLoading && rows.length > 0 && (
            <div>
              {/* Summary bar */}
              <div className="flex flex-wrap items-center gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-700">
                  {rows.length} row{rows.length !== 1 ? 's' : ''} found
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  {importableRows.length} ready
                </span>
                {errorCount > 0 && (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {errorCount} with errors
                  </span>
                )}
                <span className="text-xs text-gray-500 ml-auto">
                  Click <strong>Edit</strong> on a row to fix issues or set quantities
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {[
                        '#',
                        'Date',
                        'WA ID',
                        'Name',
                        'Phone',
                        'Tracking No.',
                        'Courier',
                        'Books',
                        'Actions',
                      ].map((h, i) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${i === 8 ? 'text-right' : 'text-left'
                            }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((row, idx) => {
                      const status = row.errors.length
                        ? 'error'
                        : row.warnings.length
                          ? 'warning'
                          : 'valid'
                      return (
                        <tr
                          key={idx}
                          className={
                            status === 'error'
                              ? 'bg-red-50/60'
                              : status === 'warning'
                                ? 'bg-amber-50/60'
                                : 'bg-white hover:bg-gray-50/60'
                          }
                        >
                          {/* # */}
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap font-mono text-xs">
                            {idx + 1}
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900">
                            {row.date || <span className="text-red-400 italic text-xs">missing</span>}
                          </td>

                          {/* WA ID */}
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-mono text-xs">
                            {row.whatsappId || (
                              <span className="text-red-400 italic text-xs">missing</span>
                            )}
                          </td>

                          {/* Name */}
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900 max-w-[160px]">
                            <span className="block truncate">
                              {row.name || (
                                <span className="text-red-400 italic text-xs">missing</span>
                              )}
                            </span>
                          </td>

                          {/* Phone */}
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-mono text-xs">
                            {row.phone || (
                              <span className="text-red-400 italic text-xs">missing</span>
                            )}
                          </td>

                          {/* Tracking No */}
                          <td className="px-4 py-3 whitespace-nowrap text-gray-900 text-xs">
                            {row.trackingNo || (
                              <span className="text-red-400 italic text-xs">missing</span>
                            )}
                          </td>

                          {/* Courier */}
                          <td className="px-4 py-3 whitespace-nowrap text-gray-700 text-xs">
                            {row.courier || (
                              <span className="text-gray-400 italic text-xs">—</span>
                            )}
                          </td>

                          {/* Books */}
                          <td className="px-4 py-3 text-gray-900">
                            <div className="max-w-[200px]">
                              {row.items.length > 0 ? (
                                <span
                                  className="block truncate text-xs"
                                  title={row.items.map((i) => `${i.title} ×${i.qty}`).join(', ')}
                                >
                                  {row.items.map((i) => `${i.title} ×${i.qty}`).join(', ')}
                                </span>
                              ) : (
                                <span className="italic text-red-400 text-xs">
                                  {row.rawBooks ? `"${row.rawBooks}" (no match)` : 'missing'}
                                </span>
                              )}
                              {row.warnings.map((w, wi) => (
                                <p key={wi} className="text-xs text-amber-600 mt-0.5 truncate" title={w}>
                                  {w}
                                </p>
                              ))}
                            </div>
                          </td>

                          {/* Edit */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <button
                              onClick={() => setEditingIdx(idx)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Pencil className="w-3 h-3" /> Edit
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {!parseLoading && rows.length > 0 && (
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
            {/* Error summary */}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {errorCount > 0 && (
                <span className="text-xs text-red-500">
                  {errorCount} row{errorCount !== 1 ? 's' : ''} skipped — fix errors via Edit
                </span>
              )}
            </div>

            {/* Import button */}
            <button
              onClick={handleImport}
              disabled={importing || importableRows.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing…
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  Import {importableRows.length} Record{importableRows.length !== 1 ? 's' : ''}
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Inner edit modal (z-[60] to sit above the import modal) */}
      {editingIdx !== null && (
        <BookTrackingImportEditModal
          row={rows[editingIdx]}
          rowIndex={editingIdx}
          books={books}
          onSave={handleSaveRow}
          onClose={() => setEditingIdx(null)}
        />
      )}
    </div>
  )
}
