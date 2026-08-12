'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  getBookTrackingPage,
  type BookTrackingRecord,
} from '@/app/actions/bookTracking'

export interface BookTrackingListState {
  rows: BookTrackingRecord[]
  total: number
  loading: boolean
  page: number
  pageSize: number
  from: string
  to: string
  search: string
  whatsappId: string
  courierName: string
  sortBy: 'created_at' | 'whatsapp_id'
  sortOrder: 'asc' | 'desc'
  /** True when any filter narrows or re-orders the list — drives the empty-state wording. */
  filtersActive: boolean
  setPage: (p: number) => void
  setPageSize: (n: number) => void
  setFrom: (v: string) => void
  setTo: (v: string) => void
  setSearch: (v: string) => void
  setWhatsappId: (v: string) => void
  setCourierName: (v: string) => void
  setSort: (by: 'created_at' | 'whatsapp_id', order: 'asc' | 'desc') => void
  toggleSort: (column: 'created_at' | 'whatsapp_id') => void
  clearFilters: () => void
  reload: () => Promise<void>
}

/** Owns the filter state, debounced search and paged fetching for the list. */
export function useBookTrackingList(): BookTrackingListState {
  const [rows, setRows] = useState<BookTrackingRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [whatsappId, setWhatsappId] = useState('')
  const [debouncedWhatsappId, setDebouncedWhatsappId] = useState('')
  const [courierName, setCourierName] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'whatsapp_id'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedWhatsappId(whatsappId.trim()), 350)
    return () => clearTimeout(t)
  }, [whatsappId])

  // Any filter or sort change puts us back on the first page.
  useEffect(() => {
    setPage(1)
  }, [from, to, debouncedSearch, debouncedWhatsappId, courierName, sortBy, sortOrder, pageSize])

  const reload = useCallback(async () => {
    setLoading(true)
    const res = await getBookTrackingPage({
      from: from || undefined,
      to: to || undefined,
      search: debouncedSearch || undefined,
      whatsappId: debouncedWhatsappId || undefined,
      courierName: courierName || undefined,
      sortBy,
      sortOrder,
      page,
      pageSize,
    })
    setRows(res.rows)
    setTotal(res.total)
    setLoading(false)
  }, [from, to, debouncedSearch, debouncedWhatsappId, courierName, sortBy, sortOrder, page, pageSize])

  useEffect(() => {
    reload()
  }, [reload])

  const setSort = useCallback((by: 'created_at' | 'whatsapp_id', order: 'asc' | 'desc') => {
    setSortBy(by)
    setSortOrder(order)
  }, [])

  const toggleSort = useCallback(
    (column: 'created_at' | 'whatsapp_id') => {
      if (sortBy !== column) {
        setSortBy(column)
        setSortOrder('asc')
      } else if (sortOrder === 'asc') {
        setSortOrder('desc')
      } else {
        setSortBy('created_at')
        setSortOrder('desc')
      }
    },
    [sortBy, sortOrder]
  )

  const clearFilters = useCallback(() => {
    setFrom('')
    setTo('')
    setSearch('')
    setWhatsappId('')
    setCourierName('')
    setSortBy('created_at')
    setSortOrder('desc')
  }, [])

  const filtersActive = !!(
    from ||
    to ||
    debouncedSearch ||
    debouncedWhatsappId ||
    courierName ||
    sortBy !== 'created_at' ||
    sortOrder !== 'desc'
  )

  return {
    rows,
    total,
    loading,
    page,
    pageSize,
    from,
    to,
    search,
    whatsappId,
    courierName,
    sortBy,
    sortOrder,
    filtersActive,
    setPage,
    setPageSize,
    setFrom,
    setTo,
    setSearch,
    setWhatsappId,
    setCourierName,
    setSort,
    toggleSort,
    clearFilters,
    reload,
  }
}
