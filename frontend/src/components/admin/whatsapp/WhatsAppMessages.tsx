'use client'

import React from 'react'
import { Pagination } from '../TableUI'
import { SendTemplateCard } from './SendTemplateCard'
import { MessageLogFilters } from './MessageLogFilters'
import { MessageLogTable } from './MessageLogTable'
import { MessageLogCards } from './MessageLogCards'
import { useMessageLog } from './useMessageLog'
import { CARD } from './styles'
import type { WhatsAppTemplate } from '@/lib/whatsapp/templates'

interface Props {
  templates: WhatsAppTemplate[]
  templatesError?: string
}

export default function WhatsAppMessages({ templates, templatesError }: Props) {
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

      <SendTemplateCard
        initialTemplates={templates}
        initialError={templatesError}
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
