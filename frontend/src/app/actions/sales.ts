'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/roles'
import { revalidatePath } from 'next/cache'
import { itemsText } from '@/lib/sales/items'
import { normalizePhone } from '@/lib/whatsapp/phone'
import type { MessageStatus } from '@/lib/whatsapp/status'

// ------------------------------------------------------------------ types

export type Category = 'general' | 'book' | 'pdf_ppt' | 'video_course'
export type CallType = 'inquiry' | 'purchase'

export interface InteractionItem {
  type: 'book' | 'pdf' | 'ppt' | 'video_course'
  id: string
  title: string
  qty?: number // quantity (books only); defaults to 1 when absent
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
  books: { id: string; title: string; price: number | null }[]
  pdfs: { id: string; title: string; price: number | null }[]
  ppts: { id: string; title: string; price: number | null }[]
  videoCourses: { id: string; title: string; price: number | null }[]
  onlineClassPrice: number | null // from Online Class Settings
}

// ------------------------------------------------------------- products

function parsePrice(v: string | null | undefined): number | null {
  if (!v) return null
  const n = parseFloat(String(v).replace(/[^0-9.]/g, ''))
  return isNaN(n) ? null : n
}

export async function getEntryProducts(): Promise<EntryProducts> {
  const supabase = await createClient()
  const [books, pdfs, ppts, videos, onlineClassPriceSetting] = await Promise.all([
    supabase.from('books').select('id, title_1, price').order('sort_order', { ascending: true }),
    supabase.from('pdfs').select('id, name, selling_price').order('created_at', { ascending: false }),
    supabase.from('ppts').select('id, name, selling_price').order('created_at', { ascending: false }),
    supabase.from('video_courses').select('id, name, selling_price').order('created_at', { ascending: false }),
    supabase.from('settings').select('value').eq('key', 'online_class_price').single(),
  ])

  return {
    books: (books.data ?? []).map((b) => ({ id: b.id, title: b.title_1, price: parsePrice(b.price) })),
    pdfs: (pdfs.data ?? []).map((p) => ({ id: p.id, title: p.name, price: parsePrice(p.selling_price) })),
    ppts: (ppts.data ?? []).map((p) => ({ id: p.id, title: p.name, price: parsePrice(p.selling_price) })),
    videoCourses: (videos.data ?? []).map((v) => ({ id: v.id, title: v.name, price: parsePrice(v.selling_price) })),
    onlineClassPrice: parsePrice(onlineClassPriceSetting.data?.value),
  }
}

// Flat price map keyed by product id – fetched fresh on each server call.
// The client-side module cache (5-min TTL) prevents repeated server calls.
// Special key '__online_class_price__' holds the price from Online Class Settings.
export async function getProductPrices(): Promise<Record<string, number>> {
  const supabase = await createClient()
  const [books, pdfs, ppts, videos, onlineClassPrice] = await Promise.all([
    supabase.from('books').select('id, price'),
    supabase.from('pdfs').select('id, selling_price'),
    supabase.from('ppts').select('id, selling_price'),
    supabase.from('video_courses').select('id, selling_price'),
    supabase.from('settings').select('value').eq('key', 'online_class_price').single(),
  ])
  const map: Record<string, number> = {}
  for (const b of books.data ?? []) { const p = parsePrice(b.price); if (p != null) map[b.id] = p }
  for (const p of pdfs.data ?? []) { const pr = parsePrice(p.selling_price); if (pr != null) map[p.id] = pr }
  for (const p of ppts.data ?? []) { const pr = parsePrice(p.selling_price); if (pr != null) map[p.id] = pr }
  for (const v of videos.data ?? []) { const pr = parsePrice(v.selling_price); if (pr != null) map[v.id] = pr }
  // Online Class price from Settings — stored under a special key
  const ocPrice = parsePrice(onlineClassPrice.data?.value)
  if (ocPrice != null) map['__online_class_price__'] = ocPrice
  return map
}

/** Call this from any admin save/update action to bust the client price cache immediately.
 *  Returns the current timestamp so the client can detect when prices were last updated. */
export async function revalidateProductPrices(): Promise<void> {
  // No-op on server — the client-side cache in InteractionModal will
  // expire after 5 min or be force-refreshed by passing force=true.
}


// ----------------------------------------------- recent calls by phone

export interface RecentByPhone {
  id: string
  name: string | null
  category: Category
  items: InteractionItem[]
  call_type: CallType
  call_at: string
}

// Last 10 interactions for a given phone number (for the entry modal preview).
export async function getRecentByPhone(phone: string): Promise<RecentByPhone[]> {
  const user = await getCurrentUser()
  if (!user || !user.isActive) return []

  const p = phone.trim()
  if (!p) return []

  const supabase = await createClient()
  const { data: customer } = await supabase
    .from('customers')
    .select('id, name')
    .eq('phone', p)
    .maybeSingle()
  if (!customer) return []

  const { data } = await supabase
    .from('interactions')
    .select('id, category, items, call_type, call_at')
    .eq('customer_id', customer.id)
    .order('call_at', { ascending: false })
    .limit(10)

  return (data ?? []).map((d: any) => ({
    id: d.id,
    name: customer.name ?? null,
    category: d.category as Category,
    items: (d.items as InteractionItem[]) ?? [],
    call_type: d.call_type as CallType,
    call_at: d.call_at,
  }))
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

const itemsLabel = (items: InteractionItem[]): string => itemsText(items, '—')

export async function updateInteraction(
  id: string,
  input: {
    phone?: string
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

  // If the phone changed, move this record to the customer with that number
  // (creating the customer when it doesn't exist yet).
  let targetCustomerId = current.customer_id
  const newPhone = input.phone?.trim()
  if (newPhone && newPhone !== current.phone) {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', newPhone)
      .maybeSingle()
    if (existing) {
      targetCustomerId = existing.id
    } else {
      const { data: created, error: custErr } = await supabase
        .from('customers')
        .insert({
          phone: newPhone,
          name: newName,
          is_auto_named: false,
          created_by: user.id,
        })
        .select('id')
        .single()
      if (custErr || !created) return { error: custErr?.message ?? 'Could not create customer' }
      targetCustomerId = created.id
    }
    edits.push({ field: 'Phone', old_value: current.phone, new_value: newPhone })
  }

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
      customer_id: targetCustomerId,
      items: input.items,
      notes: input.notes?.trim() || null,
      call_type: input.callType,
      amount: newAmount,
      call_at: input.callAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (updErr) return { error: updErr.message }

  // Keep the (target) customer's name in sync when a name was provided
  if (newName) {
    await supabase
      .from('customers')
      .update({ name: newName, is_auto_named: false, updated_at: new Date().toISOString() })
      .eq('id', targetCustomerId)
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

export async function deleteInteraction(id: string): Promise<{ success?: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'admin' || !user.isActive) return { error: 'Not authorized' }

  const supabase = await createClient()
  const { error } = await supabase.from('interactions').delete().eq('id', id)
  if (error) return { error: error.message }

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
  itemIds?: string[] // filter to records containing any of these product ids
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

  // Keep only records containing at least one of the selected products.
  if (filters.itemIds?.length) {
    const wanted = new Set(filters.itemIds)
    rows = rows.filter((r) => r.items.some((i) => wanted.has(i.id)))
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
  purchasedItemIds?: string[] // specific purchased product ids; honours purchaseMatch
  purchaseMatch?: 'any' | 'all' // 'any' = bought at least one selected; 'all' = bought every selected
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

  const data = await fetchAllPaged<any>((from, to) => {
    let q = supabase
      .from('interactions')
      .select('customer_id, category, items, call_type, amount, call_at, customers(phone, name)')
      .order('call_at', { ascending: false })
      .range(from, to)
    if (filters.from) q = q.gte('call_at', `${filters.from}T00:00:00`)
    if (filters.to) q = q.lte('call_at', `${filters.to}T23:59:59`)
    return q
  })

  type Acc = Omit<CustomerSummary, 'categories'> & { cats: Set<Category>; itemIds: Set<string> }
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
        itemIds: new Set<string>(),
      }
      map.set(d.customer_id, s)
    }
    if (d.call_type === 'purchase') {
      s.purchaseCount += 1
      s.totalSpend += Number(d.amount ?? 0)
      s.cats.add(d.category as Category)
      for (const it of (d.items as InteractionItem[]) ?? []) s.itemIds.add(it.id)
      if (!s.lastPurchaseAt || new Date(d.call_at) > new Date(s.lastPurchaseAt)) {
        s.lastPurchaseAt = d.call_at
      }
    } else {
      s.inquiryCount += 1
    }
  }

  let acc = Array.from(map.values()).filter((s) => s.purchaseCount > 0)

  // Filter by specific purchased products (honours the any/all match toggle).
  if (filters.purchasedItemIds && filters.purchasedItemIds.length) {
    const wanted = filters.purchasedItemIds
    acc =
      filters.purchaseMatch === 'all'
        ? acc.filter((s) => wanted.every((id) => s.itemIds.has(id)))
        : acc.filter((s) => wanted.some((id) => s.itemIds.has(id)))
  }

  let list: CustomerSummary[] = acc.map(({ cats, itemIds, ...rest }) => ({ ...rest, categories: Array.from(cats) }))

  if (filters.purchasedCategories && filters.purchasedCategories.length) {
    const wanted = filters.purchasedCategories
    list =
      filters.purchaseMatch === 'all'
        ? list.filter((s) => wanted.every((c) => s.categories.includes(c)))
        : list.filter((s) => wanted.some((c) => s.categories.includes(c)))
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

// ------------------------------------------------- leads (enquiry-only)

export interface LeadSummaryFilters {
  from?: string
  to?: string
  enquiredCategories?: Category[] // empty/undefined = any category
  enquiredItemIds?: string[] // specific enquired product ids; honours match
  match?: 'any' | 'all' // 'any' = enquired about at least one selected; 'all' = every selected
  search?: string
  sort?: 'recent' | 'inquiries_desc'
  page?: number // 1-based
  pageSize?: number
}

export interface LeadSummary {
  customer_id: string
  phone: string
  name: string | null
  inquiryCount: number
  categories: Category[] // categories the lead has enquired about
  lastInquiryAt: string | null
}

export interface LeadSummaryPage {
  rows: LeadSummary[]
  total: number
  totalInquiries: number
}

// PostgREST caps each response at 1000 rows regardless of .limit(), so page
// through with .range() until a short page signals the end.
async function fetchAllPaged<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>
): Promise<T[]> {
  const out: T[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build(from, from + 999)
    if (error) break
    const page = data ?? []
    out.push(...page)
    if (page.length < 1000) break
  }
  return out
}

// Aggregates leads: customers who have ONLY ever enquired and NEVER purchased
// (all-time). The date window scopes which inquiries count; the never-purchased
// test is all-time so a customer who bought outside the window is not a lead.
export async function getLeadSummaries(filters: LeadSummaryFilters): Promise<LeadSummaryPage> {
  const supabase = await createClient()

  // Every customer who has ever purchased anything (any category, all time).
  const purchaseRows = await fetchAllPaged<{ customer_id: string }>((from, to) =>
    supabase.from('interactions').select('customer_id').eq('call_type', 'purchase').range(from, to)
  )
  const everPurchased = new Set(purchaseRows.map((r) => r.customer_id))

  // Inquiries within the selected window drive the lead list.
  const inquiries = await fetchAllPaged<any>((from, to) => {
    let q = supabase
      .from('interactions')
      .select('customer_id, category, items, call_at, customers(phone, name)')
      .eq('call_type', 'inquiry')
      .order('call_at', { ascending: false })
      .range(from, to)
    if (filters.from) q = q.gte('call_at', `${filters.from}T00:00:00`)
    if (filters.to) q = q.lte('call_at', `${filters.to}T23:59:59`)
    return q
  })

  type Acc = Omit<LeadSummary, 'categories'> & { cats: Set<Category>; itemIds: Set<string> }
  const map = new Map<string, Acc>()

  for (const d of inquiries) {
    // Skip anyone who has ever bought — they are a converted customer, not a lead.
    if (everPurchased.has(d.customer_id)) continue
    const customer = Array.isArray(d.customers) ? d.customers[0] : d.customers
    let s = map.get(d.customer_id)
    if (!s) {
      s = {
        customer_id: d.customer_id,
        phone: customer?.phone ?? '',
        name: customer?.name ?? null,
        inquiryCount: 0,
        lastInquiryAt: null,
        cats: new Set<Category>(),
        itemIds: new Set<string>(),
      }
      map.set(d.customer_id, s)
    }
    s.inquiryCount += 1
    s.cats.add(d.category as Category)
    for (const it of (d.items as InteractionItem[]) ?? []) s.itemIds.add(it.id)
    if (!s.lastInquiryAt || new Date(d.call_at) > new Date(s.lastInquiryAt)) {
      s.lastInquiryAt = d.call_at
    }
  }

  let acc = Array.from(map.values()).filter((s) => s.inquiryCount > 0)

  // Filter by specific enquired products (honours the any/all match toggle).
  if (filters.enquiredItemIds && filters.enquiredItemIds.length) {
    const wanted = filters.enquiredItemIds
    acc =
      filters.match === 'all'
        ? acc.filter((s) => wanted.every((id) => s.itemIds.has(id)))
        : acc.filter((s) => wanted.some((id) => s.itemIds.has(id)))
  }

  let list: LeadSummary[] = acc.map(({ cats, itemIds, ...rest }) => ({ ...rest, categories: Array.from(cats) }))

  if (filters.enquiredCategories && filters.enquiredCategories.length) {
    const wanted = filters.enquiredCategories
    list =
      filters.match === 'all'
        ? list.filter((s) => wanted.every((c) => s.categories.includes(c)))
        : list.filter((s) => wanted.some((c) => s.categories.includes(c)))
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim().toLowerCase()
    list = list.filter(
      (s) => s.phone.toLowerCase().includes(q) || (s.name ?? '').toLowerCase().includes(q)
    )
  }

  const sort = filters.sort ?? 'recent'
  list.sort((a, b) => {
    if (sort === 'inquiries_desc') return b.inquiryCount - a.inquiryCount
    return new Date(b.lastInquiryAt ?? 0).getTime() - new Date(a.lastInquiryAt ?? 0).getTime()
  })

  const total = list.length
  const totalInquiries = list.reduce((a, c) => a + c.inquiryCount, 0)
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 25
  const page = filters.page && filters.page > 0 ? filters.page : 1
  const start = (page - 1) * pageSize
  return { rows: list.slice(start, start + pageSize), total, totalInquiries }
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
  /** Template broadcasts this customer received. Admin-only (RLS), empty otherwise. */
  messages: {
    id: string
    template_name: string
    body_preview: string | null
    status: MessageStatus
    created_at: string
    campaign_name: string | null
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

  // WhatsApp broadcasts: matched by customer id (picked from the records) or by
  // the number itself (typed in by hand), so both routes show up here.
  const normalized = normalizePhone(customer.phone)
  let messagesQuery = supabase
    .from('whatsapp_messages')
    .select('id, template_name, body_preview, status, created_at, whatsapp_campaigns(name)')
    .order('created_at', { ascending: false })
  messagesQuery = normalized
    ? messagesQuery.or(`customer_id.eq.${customerId},to_phone.eq.${normalized}`)
    : messagesQuery.eq('customer_id', customerId)

  const { data: messageRows } = await messagesQuery
  const messages = (messageRows ?? []).map((m: any) => {
    const campaign = Array.isArray(m.whatsapp_campaigns) ? m.whatsapp_campaigns[0] : m.whatsapp_campaigns
    return {
      id: m.id,
      template_name: m.template_name,
      body_preview: m.body_preview,
      status: m.status as MessageStatus,
      created_at: m.created_at,
      campaign_name: campaign?.name ?? null,
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
    messages,
    totals,
  }
}
