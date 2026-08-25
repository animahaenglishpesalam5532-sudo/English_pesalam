'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/roles'
import { SENT_STATUSES } from '@/lib/whatsapp/status'
import { getRegisterRows, type Category, type CallType, type RegisterFilters } from './sales'

/** One customer distilled from the records that matched the filter. */
export interface RecipientContact {
  customerId: string
  phone: string
  name: string | null
  /** How many matching records this customer has. */
  records: number
  categories: Category[]
  callTypes: CallType[]
  lastAt: string
}

export interface RecipientContactsResult {
  contacts: RecipientContact[]
  /** True when the underlying record query hit its 5000-row ceiling. */
  truncated: boolean
}

/**
 * Turns the familiar Records filters into a de-duplicated contact list.
 * Reuses `getRegisterRows` so the filter semantics stay identical to
 * /admin/records — one place to reason about what "last month, enquired
 * about the book" means.
 */
export async function getRecipientContacts(
  filters: RegisterFilters
): Promise<RecipientContactsResult> {
  try {
    await requireAdmin()
  } catch {
    return { contacts: [], truncated: false }
  }

  const rows = await getRegisterRows({ ...filters, page: undefined, pageSize: undefined })

  const map = new Map<string, RecipientContact & { cats: Set<Category>; types: Set<CallType> }>()
  for (const r of rows) {
    if (!r.phone) continue
    let c = map.get(r.customer_id)
    if (!c) {
      c = {
        customerId: r.customer_id,
        phone: r.phone,
        name: r.name,
        records: 0,
        categories: [],
        callTypes: [],
        lastAt: r.call_at,
        cats: new Set<Category>(),
        types: new Set<CallType>(),
      }
      map.set(r.customer_id, c)
    }
    c.records += 1
    c.cats.add(r.category)
    c.types.add(r.call_type)
    if (r.call_at > c.lastAt) c.lastAt = r.call_at
  }

  const contacts = Array.from(map.values())
    .map(({ cats, types, ...rest }) => ({
      ...rest,
      categories: Array.from(cats),
      callTypes: Array.from(types),
    }))
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt))

  return { contacts, truncated: rows.length >= 5000 }
}

/**
 * Every number that has already successfully received `templateName` — all
 * time, any campaign. Used to flag duplicates in the recipient picker.
 */
export async function getSentPhonesForTemplate(templateName: string): Promise<string[]> {
  try {
    await requireAdmin()
  } catch {
    return []
  }
  if (!templateName) return []

  const supabase = createAdminClient()
  const phones = new Set<string>()

  // PostgREST caps each response at 1000 rows, so page until a short page.
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('to_phone')
      .eq('template_name', templateName)
      .in('status', SENT_STATUSES)
      .range(from, from + 999)
    if (error) break
    for (const r of data ?? []) phones.add(r.to_phone)
    if ((data?.length ?? 0) < 1000) break
  }

  return Array.from(phones)
}
