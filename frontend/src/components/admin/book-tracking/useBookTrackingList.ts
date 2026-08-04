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
  /** True when any filter narrows the list — drives the empty-state wording. */
  filtersActive: boolean
  setPage: (p: number) => void
  setPageSize: (n: number) => void
  setFrom: (v: string) => void
  setTo: (v: string) => void
  setSearch: (v: string) => void
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

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  // Any filter change puts us back on the first page.
  useEffect(() => {
    setPage(1)
  }, [from, to, debouncedSearch, pageSize])

  const reload = useCallback(async () => {
    setLoading(true)
    const res = await getBookTrackingPage({
      from: from || undefined,
      to: to || undefined,
      search: debouncedSearch || undefined,
      page,
      pageSize,
    })
    setRows(res.rows)
    setTotal(res.total)
    setLoading(false)
  }, [from, to, debouncedSearch, page, pageSize])

  useEffect(() => {
    reload()
  }, [reload])

  const clearFilters = useCallback(() => {
    setFrom('')
    setTo('')
    setSearch('')
  }, [])

  return {
    rows,
    total,
    loading,
    page,
    pageSize,
    from,
    to,
    search,
    filtersActive: !!(from || to || debouncedSearch),
    setPage,
    setPageSize,
    setFrom,
    setTo,
    setSearch,
    clearFilters,
    reload,
  }
}
