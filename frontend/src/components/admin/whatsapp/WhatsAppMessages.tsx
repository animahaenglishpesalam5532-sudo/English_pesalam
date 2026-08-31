'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Megaphone, MessagesSquare, Settings } from 'lucide-react'
import { Pagination } from '../TableUI'
import { SendTemplateCard } from './SendTemplateCard'
import { MessageLogFilters } from './MessageLogFilters'
import { MessageLogTable } from './MessageLogTable'
import { MessageLogCards } from './MessageLogCards'
import { useMessageLog } from './useMessageLog'
import { CARD } from './styles'
import type { WhatsAppTemplate } from '@/lib/whatsapp/templates'
import type { CampaignOption } from '@/app/actions/whatsappCampaigns'
import type { EntryProducts } from '@/app/actions/sales'

interface Props {
  templates: WhatsAppTemplate[]
  templatesError?: string
  campaigns: CampaignOption[]
  products: EntryProducts
}

export default function WhatsAppMessages({
  templates,
  templatesError,
  campaigns,
  products,
}: Props) {
  const log = useMessageLog()

  const pagination = (
    <Pagination
      page={log.page}
      pageSize={log.pageSize}
      total={log.total}
      onPage={log.setPage}
      onPageSize={log.setPageSize}
      disabled={log.loading}
    />
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp Messages</h1>
        <p className="mt-1 text-sm text-gray-500">
          Send an approved template to one or more numbers, and review everything that has been
          sent.
        </p>
      </div>

      <Link
        href="/admin/whatsapp/inbox"
        className={`${CARD} mb-3 flex items-center gap-4 p-4 transition-colors hover:border-gray-200 hover:bg-gray-50`}
      >
        <span className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
          <MessagesSquare className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-gray-900">Inbox</span>
          <span className="block text-xs text-gray-500">
            Read and reply to customers who have answered — free text while their 24-hour window
            is open
          </span>
        </span>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </Link>

      <Link
        href="/admin/whatsapp/campaigns"
        className={`${CARD} mb-3 flex items-center gap-4 p-4 transition-colors hover:border-gray-200 hover:bg-gray-50`}
      >
        <span className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
          <Megaphone className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-gray-900">Campaigns</span>
          <span className="block text-xs text-gray-500">
            {campaigns.length
              ? `${campaigns.length} campaign${campaigns.length === 1 ? '' : 's'} — open to create one or see what each has sent`
              : 'Create your first campaign — every send has to be filed under one'}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </Link>

      <Link
        href="/admin/whatsapp/settings"
        className={`${CARD} mb-6 flex items-center gap-4 p-4 transition-colors hover:border-gray-200 hover:bg-gray-50`}
      >
        <span className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
          <Settings className="h-5 w-5" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-gray-900">Settings</span>
          <span className="block text-xs text-gray-500">
            Edit the auto-reply customers get the first time they message you
          </span>
        </span>
        <ChevronRight className="h-4 w-4 text-gray-400" />
      </Link>

      <SendTemplateCard
        initialTemplates={templates}
        initialError={templatesError}
        initialCampaigns={campaigns}
        products={products}
        onSent={log.reload}
      />

      <h2 className="mb-3 text-lg font-semibold text-gray-900">Sent messages</h2>

      <MessageLogFilters
        search={log.search}
        status={log.status}
        from={log.from}
        to={log.to}
        filtersActive={log.filtersActive}
        onSearch={log.setSearch}
        onStatus={log.setStatus}
        onFrom={log.setFrom}
        onTo={log.setTo}
        onClear={log.clearFilters}
      />

      <div className={`hidden md:block ${CARD} overflow-hidden`}>
        <MessageLogTable rows={log.rows} loading={log.loading} filtersActive={log.filtersActive} />
        {pagination}
      </div>

      <div className="md:hidden space-y-3">
        <MessageLogCards rows={log.rows} loading={log.loading} filtersActive={log.filtersActive} />
        <div className={CARD}>{pagination}</div>
      </div>
    </div>
  )
}
