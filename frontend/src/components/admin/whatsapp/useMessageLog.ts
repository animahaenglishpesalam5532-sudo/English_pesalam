'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  getWhatsappMessagesPage,
  type WhatsAppMessageRecord,
} from '@/app/actions/whatsapp'

export interface MessageLogState {
  rows: WhatsAppMessageRecord[]
  total: number
  loading: boolean
  page: number
  pageSize: number
  from: string
  to: string
  search: string
  status: '' | 'sent' | 'failed'
  filtersActive: boolean
  setPage: (p: number) => void
  setPageSize: (n: number) => void
  setFrom: (v: string) => void
  setTo: (v: string) => void
  setSearch: (v: string) => void
  setStatus: (v: '' | 'sent' | 'failed') => void
  clearFilters: () => void
  reload: () => Promise<void>
}

/** Owns the filter state, debounced search and paged fetching for the log. */
export function useMessageLog(): MessageLogState {
  const [rows, setRows] = useState<WhatsAppMessageRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<'' | 'sent' | 'failed'>('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  // Any filter change puts us back on the first page.
  useEffect(() => {
    setPage(1)
  }, [from, to, debouncedSearch, status, pageSize])

  const reload = useCallback(async () => {
    setLoading(true)
    const res = await getWhatsappMessagesPage({
      from: from || undefined,
      to: to || undefined,
      search: debouncedSearch || undefined,
      status: status || undefined,
      page,
      pageSize,
    })
    setRows(res.rows)
    setTotal(res.total)
    setLoading(false)
  }, [from, to, debouncedSearch, status, page, pageSize])

  useEffect(() => {
    reload()
  }, [reload])

  const clearFilters = useCallback(() => {
    setFrom('')
    setTo('')
    setSearch('')
    setStatus('')
  }, [])

  const filtersActive = !!(from || to || debouncedSearch || status)

  return {
    rows,
    total,
    loading,
    page,
    pageSize,
    from,
    to,
    search,
    status,
    filtersActive,
    setPage,
    setPageSize,
    setFrom,
    setTo,
    setSearch,
    setStatus,
    clearFilters,
    reload,
  }
}
