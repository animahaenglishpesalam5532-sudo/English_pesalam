'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/roles'
import { revalidatePath } from 'next/cache'

// ------------------------------------------------------------------ types

export type Category = 'general' | 'book' | 'pdf_ppt' | 'video_course'
export type CallType = 'inquiry' | 'purchase'

export interface InteractionItem {
  type: 'book' | 'pdf' | 'ppt' | 'video_course'
  id: string
  title: string
}

export interface LogInteractionInput {
  phone: string
  name?: string
  category: Category
  items: InteractionItem[]
  notes?: string
  callType: CallType
  amount?: number | null
  callAt: string // ISO string
}

export interface EntryProducts {
  books: { id: string; title: string }[]
  pdfs: { id: string; title: string }[]
  ppts: { id: string; title: string }[]
  videoCourses: { id: string; title: string }[]
}

// ------------------------------------------------------------- products

export async function getEntryProducts(): Promise<EntryProducts> {
  const supabase = await createClient()
  const [books, pdfs, ppts, videos] = await Promise.all([
    supabase.from('books').select('id, title_1').order('sort_order', { ascending: true }),
    supabase.from('pdfs').select('id, name').order('created_at', { ascending: false }),
    supabase.from('ppts').select('id, name').order('created_at', { ascending: false }),
    supabase.from('video_courses').select('id, name').order('created_at', { ascending: false }),
  ])

  return {
    books: (books.data ?? []).map((b) => ({ id: b.id, title: b.title_1 })),
    pdfs: (pdfs.data ?? []).map((p) => ({ id: p.id, title: p.name })),
    ppts: (ppts.data ?? []).map((p) => ({ id: p.id, title: p.name })),
    videoCourses: (videos.data ?? []).map((v) => ({ id: v.id, title: v.name })),
  }
}

// --------------------------------------------------------- create call

export async function logInteraction(
  input: LogInteractionInput
): Promise<{ success?: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user || !user.isActive) return { error: 'Not authorized' }

  const phone = input.phone.trim()
  if (!phone) return { error: 'Phone number is required' }
  if (input.callType === 'purchase' && (input.amount == null || input.amount <= 0)) {
    return { error: 'Amount is required for a purchase' }
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('log_interaction', {
    p_phone: phone,
    p_name: input.name?.trim() || null,
    p_category: input.category,
    p_items: input.items ?? [],
    p_notes: input.notes?.trim() || null,
    p_call_type: input.callType,
    p_amount: input.callType === 'purchase' ? input.amount : null,
    p_call_at: input.callAt,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/sales-register')
  revalidatePath('/admin/records')
  revalidatePath('/admin/dashboard')
  return { success: true }
}

// ------------------------------------------------------- edit + audit

export interface EditableInteraction {
  id: string
  customer_id: string
  phone: string
  name: string | null
  category: Category
  items: InteractionItem[]
  notes: string | null
  call_type: CallType
  amount: number | null
  call_at: string
}

export async function getInteractionForEdit(
  id: string
): Promise<EditableInteraction | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('interactions')
    .select('id, customer_id, category, items, notes, call_type, amount, call_at, customers(phone, name)')
    .eq('id', id)
    .single()
  if (error || !data) return null

  // Supabase returns the joined relation as an object (single) or array.
  const customer = Array.isArray(data.customers) ? data.customers[0] : data.customers

  return {
    id: data.id,
    customer_id: data.customer_id,
    phone: customer?.phone ?? '',
    name: customer?.name ?? null,
    category: data.category as Category,
    items: (data.items as InteractionItem[]) ?? [],
    notes: data.notes,
    call_type: data.call_type as CallType,
    amount: data.amount,
    call_at: data.call_at,
  }
}

function itemsLabel(items: InteractionItem[]): string {
  return (items ?? []).map((i) => i.title).join(', ') || '—'
}

export async function updateInteraction(
  id: string,
  input: {
    name?: string
    items: InteractionItem[]
    notes?: string
    callType: CallType
    amount?: number | null
    callAt: string
  }
): Promise<{ success?: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user || !user.isActive) return { error: 'Not authorized' }

  if (input.callType === 'purchase' && (input.amount == null || input.amount <= 0)) {
    return { error: 'Amount is required for a purchase' }
  }

  const supabase = await createClient()
  const current = await getInteractionForEdit(id)
  if (!current) return { error: 'Record not found' }

  const edits: { field: string; old_value: string | null; new_value: string | null }[] = []
  const newName = input.name?.trim() || null
  const newAmount = input.callType === 'purchase' ? input.amount ?? null : null

  if ((current.name || null) !== newName) {
    edits.push({ field: 'Name', old_value: current.name, new_value: newName })
  }
  if ((current.notes || null) !== (input.notes?.trim() || null)) {
    edits.push({ field: 'Notes', old_value: current.notes, new_value: input.notes?.trim() || null })
  }
  if (current.call_type !== input.callType) {
    edits.push({ field: 'Call type', old_value: current.call_type, new_value: input.callType })
  }
  if (Number(current.amount ?? 0) !== Number(newAmount ?? 0)) {
    edits.push({
      field: 'Amount',
      old_value: current.amount != null ? String(current.amount) : null,
      new_value: newAmount != null ? String(newAmount) : null,
    })
  }
  if (new Date(current.call_at).getTime() !== new Date(input.callAt).getTime()) {
    edits.push({ field: 'Date & time', old_value: current.call_at, new_value: input.callAt })
  }
  if (JSON.stringify(current.items) !== JSON.stringify(input.items)) {
    edits.push({ field: 'Products', old_value: itemsLabel(current.items), new_value: itemsLabel(input.items) })
  }

  // Update the interaction
  const { error: updErr } = await supabase
    .from('interactions')
    .update({
      items: input.items,
      notes: input.notes?.trim() || null,
      call_type: input.callType,
      amount: newAmount,
      call_at: input.callAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (updErr) return { error: updErr.message }

  // Update customer name if it changed
  if ((current.name || null) !== newName && newName) {
    await supabase
      .from('customers')
      .update({ name: newName, is_auto_named: false, updated_at: new Date().toISOString() })
      .eq('id', current.customer_id)
  }

  // Write audit rows
  if (edits.length > 0) {
    await supabase.from('interaction_edits').insert(
      edits.map((e) => ({
        interaction_id: id,
        field: e.field,
        old_value: e.old_value,
        new_value: e.new_value,
        edited_by: user.id,
      }))
    )
  }

  revalidatePath('/admin/sales-register')
  revalidatePath('/admin/records')
  revalidatePath('/admin/my-records')
  return { success: true }
}

// --------------------------------------------------- admin: register data

export interface RegisterFilters {
  from?: string // ISO date (inclusive)
  to?: string // ISO date (inclusive)
  category?: Category | 'all'
  categories?: Category[] // multi-select; when set, takes precedence over `category`
  callType?: CallType | 'all'
  staffId?: string | 'all'
  search?: string // name or phone
  sort?: 'recent' | 'oldest' | 'amount_desc'
  onlyLeads?: boolean // customers who only ever enquired (never purchased)
  page?: number // 1-based
  pageSize?: number
}

export interface RegisterRow {
  id: string
  customer_id: string
  phone: string
  name: string | null
  category: Category
  items: InteractionItem[]
  notes: string | null
  call_type: CallType
  amount: number | null
  call_at: string
  created_by: string | null
  staff_name: string | null
}

export async function getRegisterRows(filters: RegisterFilters): Promise<RegisterRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from('interactions')
    .select(
      'id, customer_id, category, items, notes, call_type, amount, call_at, created_by, customers(phone, name), profiles!interactions_created_by_fkey(full_name)'
    )

  if (filters.from) query = query.gte('call_at', `${filters.from}T00:00:00`)
  if (filters.to) query = query.lte('call_at', `${filters.to}T23:59:59`)
  if (filters.categories?.length) query = query.in('category', filters.categories)
  else if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category)
  if (filters.callType && filters.callType !== 'all') query = query.eq('call_type', filters.callType)
  if (filters.staffId && filters.staffId !== 'all') query = query.eq('created_by', filters.staffId)

  const ascending = filters.sort === 'oldest'
  if (filters.sort === 'amount_desc') {
    query = query.order('amount', { ascending: false, nullsFirst: false }).order('call_at', { ascending: false })
  } else {
    query = query.order('call_at', { ascending })
  }
  query = query.limit(5000)

  const { data, error } = await query
  if (error || !data) return []

  let rows: RegisterRow[] = data.map((d: any) => {
    const customer = Array.isArray(d.customers) ? d.customers[0] : d.customers
    const profile = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles
    return {
      id: d.id,
      customer_id: d.customer_id,
      phone: customer?.phone ?? '',
      name: customer?.name ?? null,
      category: d.category,
      items: d.items ?? [],
      notes: d.notes,
      call_type: d.call_type,
      amount: d.amount,
      call_at: d.call_at,
      created_by: d.created_by,
      staff_name: profile?.full_name ?? null,
    }
  })

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    rows = rows.filter(
      (r) => r.phone.toLowerCase().includes(q) || (r.name ?? '').toLowerCase().includes(q)
    )
  }

  // Keep only records from customers who have NEVER purchased (pure leads).
  if (filters.onlyLeads) {
    const { data: purch } = await supabase
      .from('interactions')
      .select('customer_id')
      .eq('call_type', 'purchase')
    const buyerIds = new Set((purch ?? []).map((p: any) => p.customer_id))
    rows = rows.filter((r) => !buyerIds.has(r.customer_id))
  }

  return rows
}

export interface RegisterPage {
  rows: RegisterRow[]
  total: number
}

// Paginated slice of the register for table views.
export async function getRegisterPage(filters: RegisterFilters): Promise<RegisterPage> {
  const all = await getRegisterRows(filters)
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 25
  const page = filters.page && filters.page > 0 ? filters.page : 1
  const start = (page - 1) * pageSize
  return { rows: all.slice(start, start + pageSize), total: all.length }
}

// ------------------------------------------- customer purchase summaries

export interface CustomerSummaryFilters {
  from?: string
  to?: string
  purchasedCategories?: Category[] // empty/undefined = any product
  search?: string
  sort?: 'spend_desc' | 'purchases_desc' | 'recent'
  page?: number // 1-based
  pageSize?: number
}

export interface CustomerSummaryPage {
  rows: CustomerSummary[]
  total: number
  totalRevenue: number
  totalPurchases: number
}

export interface CustomerSummary {
  customer_id: string
  phone: string
  name: string | null
  totalSpend: number
  purchaseCount: number
  inquiryCount: number
  categories: Category[] // categories the customer has purchased in
  lastPurchaseAt: string | null
}

// Aggregates paying customers (>= 1 purchase) with their spend and category mix.
export async function getCustomerSummaries(
  filters: CustomerSummaryFilters
): Promise<CustomerSummaryPage> {
  const supabase = await createClient()

  let query = supabase
    .from('interactions')
    .select('customer_id, category, call_type, amount, call_at, customers(phone, name)')
    .order('call_at', { ascending: false })
    .limit(10000)

  if (filters.from) query = query.gte('call_at', `${filters.from}T00:00:00`)
  if (filters.to) query = query.lte('call_at', `${filters.to}T23:59:59`)

  const { data, error } = await query
  if (error || !data) return { rows: [], total: 0, totalRevenue: 0, totalPurchases: 0 }

  type Acc = Omit<CustomerSummary, 'categories'> & { cats: Set<Category> }
  const map = new Map<string, Acc>()

  for (const d of data as any[]) {
    const customer = Array.isArray(d.customers) ? d.customers[0] : d.customers
    let s = map.get(d.customer_id)
    if (!s) {
      s = {
        customer_id: d.customer_id,
        phone: customer?.phone ?? '',
        name: customer?.name ?? null,
        totalSpend: 0,
        purchaseCount: 0,
        inquiryCount: 0,
        lastPurchaseAt: null,
        cats: new Set<Category>(),
      }
      map.set(d.customer_id, s)
    }
    if (d.call_type === 'purchase') {
      s.purchaseCount += 1
      s.totalSpend += Number(d.amount ?? 0)
      s.cats.add(d.category as Category)
      if (!s.lastPurchaseAt || new Date(d.call_at) > new Date(s.lastPurchaseAt)) {
        s.lastPurchaseAt = d.call_at
      }
    } else {
      s.inquiryCount += 1
    }
  }

  let list: CustomerSummary[] = Array.from(map.values())
    .filter((s) => s.purchaseCount > 0)
    .map(({ cats, ...rest }) => ({ ...rest, categories: Array.from(cats) }))

  if (filters.purchasedCategories && filters.purchasedCategories.length) {
    const wanted = filters.purchasedCategories
    list = list.filter((s) => wanted.some((c) => s.categories.includes(c)))
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    list = list.filter(
      (s) => s.phone.toLowerCase().includes(q) || (s.name ?? '').toLowerCase().includes(q)
    )
  }

  const sort = filters.sort ?? 'spend_desc'
  list.sort((a, b) => {
    if (sort === 'purchases_desc') return b.purchaseCount - a.purchaseCount || b.totalSpend - a.totalSpend
    if (sort === 'recent') {
      return new Date(b.lastPurchaseAt ?? 0).getTime() - new Date(a.lastPurchaseAt ?? 0).getTime()
    }
    return b.totalSpend - a.totalSpend
  })

  const total = list.length
  const totalRevenue = list.reduce((a, c) => a + c.totalSpend, 0)
  const totalPurchases = list.reduce((a, c) => a + c.purchaseCount, 0)
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 25
  const page = filters.page && filters.page > 0 ? filters.page : 1
  const start = (page - 1) * pageSize
  return { rows: list.slice(start, start + pageSize), total, totalRevenue, totalPurchases }
}

export interface StaffOption {
  id: string
  name: string
}

export async function getStaffOptions(): Promise<StaffOption[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .order('full_name', { ascending: true })
  return (data ?? []).map((p) => ({ id: p.id, name: p.full_name || p.email }))
}

// --------------------------------------------- admin: customer timeline

export interface CustomerTimeline {
  customer: { id: string; phone: string; name: string | null; created_at: string }
  interactions: {
    id: string
    category: Category
    items: InteractionItem[]
    notes: string | null
    call_type: CallType
    amount: number | null
    call_at: string
    staff_name: string | null
    edits: { field: string; old_value: string | null; new_value: string | null; edited_at: string }[]
  }[]
  totals: { calls: number; inquiries: number; purchases: number; revenue: number }
}

export async function getCustomerTimeline(customerId: string): Promise<CustomerTimeline | null> {
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from('customers')
    .select('id, phone, name, created_at')
    .eq('id', customerId)
    .single()
  if (!customer) return null

  const { data: rows } = await supabase
    .from('interactions')
    .select(
      'id, category, items, notes, call_type, amount, call_at, profiles!interactions_created_by_fkey(full_name), interaction_edits(field, old_value, new_value, edited_at)'
    )
    .eq('customer_id', customerId)
    .order('call_at', { ascending: false })

  const interactions = (rows ?? []).map((d: any) => {
    const profile = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles
    return {
      id: d.id,
      category: d.category as Category,
      items: (d.items as InteractionItem[]) ?? [],
      notes: d.notes,
      call_type: d.call_type as CallType,
      amount: d.amount,
      call_at: d.call_at,
      staff_name: profile?.full_name ?? null,
      edits: (d.interaction_edits ?? []).sort(
        (a: any, b: any) => new Date(b.edited_at).getTime() - new Date(a.edited_at).getTime()
      ),
    }
  })

  const totals = interactions.reduce(
    (acc, i) => {
      acc.calls += 1
      if (i.call_type === 'inquiry') acc.inquiries += 1
      if (i.call_type === 'purchase') {
        acc.purchases += 1
        acc.revenue += Number(i.amount ?? 0)
      }
      return acc
    },
    { calls: 0, inquiries: 0, purchases: 0, revenue: 0 }
  )

  return {
    customer,
    interactions,
    totals,
  }
}
