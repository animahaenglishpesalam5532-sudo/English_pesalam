'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { ArrowLeft, Megaphone, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { CampaignFormModal } from './CampaignFormModal'
import { useCampaigns } from './useCampaigns'
import { Pagination } from '../../TableUI'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CARD, FILTER_INPUT } from '../styles'
import { deleteCampaign, type CampaignWithStats } from '@/app/actions/whatsappCampaigns'

function fmtDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function dateRange(c: CampaignWithStats) {
  if (c.starts_on && c.ends_on) return `${fmtDate(c.starts_on)} → ${fmtDate(c.ends_on)}`
  if (c.starts_on) return `From ${fmtDate(c.starts_on)}`
  if (c.ends_on) return `Until ${fmtDate(c.ends_on)}`
  return 'No dates set'
}

export default function CampaignsBoard() {
  const list = useCampaigns()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CampaignWithStats | null>(null)
  const [deleting, setDeleting] = useState<CampaignWithStats | null>(null)
  const [busy, setBusy] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }

  // Cards are links, so the action buttons must not navigate.
  const openEdit = (e: React.MouseEvent, c: CampaignWithStats) => {
    e.preventDefault()
    e.stopPropagation()
    setEditing(c)
    setFormOpen(true)
  }

  const openDelete = (e: React.MouseEvent, c: CampaignWithStats) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleting(c)
  }

  const confirmDelete = async () => {
    if (!deleting?.id) return
    setBusy(true)
    const res = await deleteCampaign(deleting.id)
    setBusy(false)
    if (res?.error) return toast.error(res.error)
    toast.success('Campaign deleted')
    setDeleting(null)
    list.reload()
  }

  const deletingMessages = (deleting?.sent ?? 0) + (deleting?.failed ?? 0)

  return (
    <div>
      <Link
        href="/admin/whatsapp"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" /> WhatsApp Messages
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="mt-1 text-sm text-gray-500">
            Every broadcast is filed under a campaign. Open one to see what went out and when.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" /> New campaign
        </button>
      </div>

      <div className={`${CARD} mb-4 flex flex-wrap items-center gap-3 p-3`}>
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={list.search}
            onChange={(e) => list.setSearch(e.target.value)}
            placeholder="Search campaign name or description..."
            className={`${FILTER_INPUT} pl-9`}
          />
        </div>
        {list.search && (
          <button
            type="button"
            onClick={() => list.setSearch('')}
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
        <span className="text-sm text-gray-500">{list.total} total</span>
      </div>

      {list.loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${CARD} p-4`}>
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-100" />
              <div className="mt-4 h-3 w-2/3 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : list.rows.length === 0 ? (
        <div className={`${CARD} p-12 text-center`}>
          <Megaphone className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-900">
            {list.searchActive ? 'No campaigns match that search' : 'No campaigns yet'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {list.searchActive
              ? 'Try a different name.'
              : 'Create one before sending your first broadcast.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.rows.map((c) => (
            <Link
              key={c.id}
              href={`/admin/whatsapp/campaigns/${c.id}`}
              className={`${CARD} relative block p-4 transition-shadow hover:shadow-md`}
            >
              <div className="absolute right-3 top-3 flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => openEdit(e, c)}
                  title="Edit campaign"
                  aria-label={`Edit ${c.name}`}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => openDelete(e, c)}
                  title="Delete campaign"
                  aria-label={`Delete ${c.name}`}
                  className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <h2 className="pr-16 text-sm font-semibold text-gray-900">{c.name}</h2>
              <p className="mt-0.5 text-xs text-gray-400">{dateRange(c)}</p>
              {c.description && (
                <p className="mt-2 line-clamp-2 text-xs text-gray-600">{c.description}</p>
              )}

              <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3 text-xs">
                <span className="font-semibold text-emerald-700">{c.sent} sent</span>
                {c.failed > 0 && <span className="font-semibold text-red-600">{c.failed} failed</span>}
                <span className="text-gray-400">
                  {c.templates.length} template{c.templates.length === 1 ? '' : 's'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className={`${CARD} mt-4`}>
        <Pagination
          page={list.page}
          pageSize={list.pageSize}
          total={list.total}
          onPage={list.setPage}
          onPageSize={list.setPageSize}
          disabled={list.loading}
        />
      </div>

      <CampaignFormModal
        open={formOpen}
        campaign={editing}
        onClose={() => setFormOpen(false)}
        onSaved={list.reload}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        busy={busy}
        title="Delete campaign"
        message={
          <>
            <p>
              Delete <strong>{deleting?.name}</strong>? This cannot be undone.
            </p>
            {deletingMessages > 0 && (
              <p className="mt-2">
                {deletingMessages} sent message{deletingMessages === 1 ? '' : 's'} will stay in the
                history but will no longer be grouped under this campaign.
              </p>
            )}
          </>
        }
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
