'use client'

import { useCallback, useEffect, useState } from 'react'
import { getCampaignsPage, type CampaignWithStats } from '@/app/actions/whatsappCampaigns'

export interface CampaignsListState {
  rows: CampaignWithStats[]
  total: number
  loading: boolean
  page: number
  pageSize: number
  search: string
  searchActive: boolean
  setPage: (p: number) => void
  setPageSize: (n: number) => void
  setSearch: (v: string) => void
  reload: () => Promise<void>
}

/** Debounced search + paged fetching for the campaigns board. */
export function useCampaigns(pageSizeDefault = 25): CampaignsListState {
  const [rows, setRows] = useState<CampaignWithStats[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(pageSizeDefault)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  // A new search or page size puts us back on the first page.
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, pageSize])

  const reload = useCallback(async () => {
    setLoading(true)
    const res = await getCampaignsPage({
      search: debouncedSearch || undefined,
      page,
      pageSize,
    })
    setRows(res.rows)
    setTotal(res.total)
    setLoading(false)
  }, [debouncedSearch, page, pageSize])

  useEffect(() => {
    reload()
  }, [reload])

  return {
    rows,
    total,
    loading,
    page,
    pageSize,
    search,
    searchActive: !!debouncedSearch,
    setPage,
    setPageSize,
    setSearch,
    reload,
  }
}
