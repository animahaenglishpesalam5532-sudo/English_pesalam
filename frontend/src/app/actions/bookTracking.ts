'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireDelivery, requireDeliveryOrStaff } from '@/lib/auth/roles'
import { revalidatePath } from 'next/cache'

export interface BookOption {
  id: string
  title: string
}

export interface TrackedBook {
  id: string
  title: string
  qty: number
}

export interface BookTrackingRecord {
  id: string
  whatsapp_id: string
  name: string
  phone: string
  courier_name?: string | null
  tracking_number: string
  items: TrackedBook[]
  created_at: string
}

export interface BookTrackingInput {
  whatsappId: string
  name: string
  phone: string
  courierName?: string | null
  trackingNumber: string
  items: TrackedBook[]
  createdAt?: string
}

export interface BookTrackingFilters {
  from?: string // yyyy-mm-dd, inclusive
  to?: string // yyyy-mm-dd, inclusive
  search?: string // WhatsApp ID / name / phone / tracking number / courier
  whatsappId?: string // Dedicated filter for WhatsApp ID
  courierName?: string // Filter by Courier Name
  sortBy?: 'created_at' | 'whatsapp_id'
  sortOrder?: 'asc' | 'desc'
  page?: number // 1-based
  pageSize?: number
}

export interface BookTrackingPage {
  rows: BookTrackingRecord[]
  total: number
}

/** Books the admin manages, for the entry modal's book picker. */
export async function getBookOptions(): Promise<BookOption[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('books')
    .select('id, title_1')
    .order('sort_order', { ascending: true })
  return (data ?? [])?.map((b) => ({ id: b.id, title: b.title_1 }))
}

/**
 * Returns the subset of the given WhatsApp IDs that already exist in the DB.
 * Used by the import modal to flag duplicates before committing.
 */
export async function getDuplicateWhatsappIds(ids: string[]): Promise<string[]> {
  try {
    await requireDelivery()
  } catch {
    return []
  }
  if (!ids?.length) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('book_tracking')
    .select('whatsapp_id')
    .in('whatsapp_id', ids)
  return (data ?? []).map((r) => String(r.whatsapp_id))
}

export async function getBookTrackingPage(
  filters: BookTrackingFilters
): Promise<BookTrackingPage> {
  try {
    await requireDeliveryOrStaff()
  } catch {
    return { rows: [], total: 0 }
  }

  const supabase = createAdminClient()
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 25
  const page = filters.page && filters.page > 0 ? filters.page : 1
  const from = (page - 1) * pageSize

  let query = supabase
    .from('book_tracking')
    .select('id, whatsapp_id, name, phone, courier_name, tracking_number, items, created_at', {
      count: 'exact',
    })

  const sortBy = filters.sortBy ?? 'created_at'
  const ascending = filters.sortOrder === 'asc'
  query = query.order(sortBy, { ascending })
  if (sortBy !== 'created_at') {
    query = query.order('created_at', { ascending: false })
  }

  if (filters.from) query = query.gte('created_at', `${filters.from}T00:00:00`)
  if (filters.to) query = query.lte('created_at', `${filters.to}T23:59:59`)

  if (filters.whatsappId?.trim()) {
    query = query.ilike('whatsapp_id', `%${filters.whatsappId.trim()}%`)
  }

  if (filters.courierName?.trim()) {
    query = query.eq('courier_name', filters.courierName.trim())
  }

  const search = filters.search?.trim()
  if (search) {
    // Escape PostgREST's `or` list separators so a search term cannot alter the filter.
    const term = search.replace(/[(),\\]/g, ' ').trim()
    if (term) {
      query = query.or(
        `whatsapp_id.ilike.%${term}%,name.ilike.%${term}%,phone.ilike.%${term}%,tracking_number.ilike.%${term}%,courier_name.ilike.%${term}%`
      )
    }
  }

  const { data, count, error } = await query.range(from, from + pageSize - 1)
  if (error) return { rows: [], total: 0 }

  return {
    rows: (data ?? []).map((d) => ({
      id: d.id,
      whatsapp_id: d.whatsapp_id,
      name: d.name,
      phone: d.phone,
      courier_name: d.courier_name ?? null,
      tracking_number: d.tracking_number,
      items: (d.items as TrackedBook[]) ?? [],
      created_at: d.created_at,
    })),
    total: count ?? 0,
  }
}

function validate(input: BookTrackingInput): string | null {
  if (!input.whatsappId?.trim()) return 'WhatsApp ID is required'
  if (!input.name?.trim()) return 'Name is required'
  if (!input.phone?.trim()) return 'Phone number is required'
  if (!input.trackingNumber?.trim()) return 'Tracking number is required'
  if (input.createdAt && isNaN(new Date(input.createdAt).getTime())) {
    return 'Invalid date'
  }
  if (!input.items?.length) return 'Select at least one book'
  if (input.items?.some((i) => !Number.isInteger(i.qty) || i.qty < 1)) {
    return 'Minimum quantity should be 1'
  }
  return null
}

export async function createBookTracking(
  input: BookTrackingInput
): Promise<{ success?: boolean; error?: string }> {
  let user
  try {
    user = await requireDelivery()
  } catch {
    return { error: 'Not authorized' }
  }

  const invalid = validate(input)
  if (invalid) return { error: invalid }

  const supabase = await createClient()

  // Enforce WhatsApp ID uniqueness
  const waId = input.whatsappId.trim()
  const { count: existing } = await supabase
    .from('book_tracking')
    .select('id', { count: 'exact', head: true })
    .eq('whatsapp_id', waId)
  if (existing && existing > 0) {
    return { error: `A record with WhatsApp ID "${waId}" already exists` }
  }

  let createdAt: string | undefined
  if (input.createdAt?.trim()) {
    const trimmed = input.createdAt.trim()
    createdAt = trimmed.includes('T') ? trimmed : `${trimmed}T12:00:00.000Z`
  }

  const { error } = await supabase.from('book_tracking').insert({
    whatsapp_id: waId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    courier_name: input.courierName?.trim() || null,
    tracking_number: input.trackingNumber.trim(),
    items: input.items,
    created_by: user?.id,
    ...(createdAt ? { created_at: createdAt } : {}),
  })
  if (error) return { error: error.message }

  revalidatePath('/admin/book-tracking')
  return { success: true }
}

export async function updateBookTracking(
  id: string,
  input: BookTrackingInput
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireDelivery()
  } catch {
    return { error: 'Not authorized' }
  }

  const invalid = validate(input)
  if (invalid) return { error: invalid }

  const supabase = await createClient()

  // Enforce WhatsApp ID uniqueness (excluding the current record)
  const waId = input.whatsappId.trim()
  const { count: existing } = await supabase
    .from('book_tracking')
    .select('id', { count: 'exact', head: true })
    .eq('whatsapp_id', waId)
    .neq('id', id)
  if (existing && existing > 0) {
    return { error: `A record with WhatsApp ID "${waId}" already exists` }
  }

  let createdAt: string | undefined
  if (input.createdAt?.trim()) {
    const trimmed = input.createdAt.trim()
    createdAt = trimmed.includes('T') ? trimmed : `${trimmed}T12:00:00.000Z`
  }

  const { error } = await supabase
    .from('book_tracking')
    .update({
      whatsapp_id: waId,
      name: input.name.trim(),
      phone: input.phone.trim(),
      courier_name: input.courierName?.trim() || null,
      tracking_number: input.trackingNumber.trim(),
      items: input.items,
      ...(createdAt ? { created_at: createdAt } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/book-tracking')
  return { success: true }
}

/** Admin or Delivery member can remove a record. */
export async function deleteBookTracking(
  id: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    await requireDelivery()
  } catch {
    return { error: 'Not authorized' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('book_tracking').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/book-tracking')
  return { success: true }
}

/** Bulk-insert multiple records at once (import from Excel / CSV).
 *  Records whose WhatsApp ID already exists in the DB are silently skipped. */
export async function bulkImportBookTracking(
  inputs: BookTrackingInput[]
): Promise<{ success?: boolean; imported?: number; skipped?: number; error?: string }> {
  let user
  try {
    user = await requireDelivery()
  } catch {
    return { error: 'Not authorized' }
  }

  if (!inputs?.length) return { error: 'No records to import' }

  const supabase = await createClient()

  // Find which WhatsApp IDs already exist so we can skip them
  const incomingIds = inputs.map((i) => i.whatsappId?.trim()).filter(Boolean)
  const { data: existing } = await supabase
    .from('book_tracking')
    .select('whatsapp_id')
    .in('whatsapp_id', incomingIds)
  const existingSet = new Set((existing ?? []).map((r) => String(r.whatsapp_id)))

  const newInputs = inputs.filter((i) => !existingSet.has(i.whatsappId?.trim() ?? ''))
  const skipped = inputs.length - newInputs.length

  if (!newInputs.length) {
    return { success: true, imported: 0, skipped }
  }

  const records = newInputs.map((input) => {
    const trimmedDate = input.createdAt?.trim()
    const createdAt = trimmedDate
      ? trimmedDate.includes('T')
        ? trimmedDate
        : `${trimmedDate}T12:00:00.000Z`
      : undefined

    return {
      whatsapp_id: input.whatsappId?.trim(),
      name: input.name?.trim(),
      phone: input.phone?.trim(),
      courier_name: input.courierName?.trim() || null,
      tracking_number: input.trackingNumber?.trim(),
      items: input.items,
      created_by: user?.id,
      ...(createdAt ? { created_at: createdAt } : {}),
    }
  })

  const { error } = await supabase.from('book_tracking').insert(records)
  if (error) return { error: error.message }

  revalidatePath('/admin/book-tracking')
  return { success: true, imported: records.length, skipped }
}
