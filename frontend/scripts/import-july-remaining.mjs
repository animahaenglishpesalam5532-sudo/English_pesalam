/**
 * One-off: import the REMAINING July 2026 book records (21 Jul - 29 Jul) from
 * "BOOK STATUS REPORT - July - 2026 (1).csv". The DB already has 01-20 Jul fully
 * imported plus a single stray 21-Jul inquiry.
 *
 * Steps:
 *   1. Delete the existing category='book' interactions dated 21-Jul-2026
 *      (the DB has 1; the new file has 37 for that day) to avoid a duplicate.
 *   2. Import every new-file row with date >= 2026-07-21 (i.e. 21-29 Jul):
 *        - reuse customer by phone if it exists, else create (continue auto-names)
 *        - qty >= 1 -> purchase (amount = qty * book price, item = the book)
 *          empty    -> inquiry
 *   3. Clean up any customer left with zero interactions by step 1.
 *
 * Leaves 20-Jul (and everything before) untouched.
 *
 * Run from frontend/:  node scripts/import-july-remaining.mjs
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const CSV_PATH = 'public/import-data/BOOK STATUS REPORT - July - 2026 (1).csv'
const SALESPERSON_EMAIL = 'salesperson@gmail.com'
const CUTOFF = '2026-07-21' // import rows on/after this date
const DELETE_DAY_START = '2026-07-21T00:00:00Z'
const DELETE_DAY_END = '2026-07-22T00:00:00Z'
const EXPECTED_YEAR = 2026

const env = Object.fromEntries(
  fs
    .readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    })
)
const url = env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

function normalizePhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}

const dateWarnings = []
function parseDateParts(raw) {
  const m = String(raw ?? '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  let [, dd, mm, yyyy] = m
  if (+yyyy !== EXPECTED_YEAR) {
    dateWarnings.push(`${dd}/${mm}/${yyyy} -> year corrected to ${EXPECTED_YEAR}`)
    yyyy = String(EXPECTED_YEAR)
  }
  const ymd = `${yyyy}-${mm}-${dd}`
  const iso = new Date(Date.UTC(+yyyy, +mm - 1, +dd, 12, 0, 0)).toISOString()
  return { ymd, iso }
}

async function fetchAllCustomers() {
  const all = []
  const PAGE = 1000
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('customers')
      .select('id, phone, name')
      .range(from, from + PAGE - 1)
    if (error) {
      console.error('Could not read customers:', error.message)
      process.exit(1)
    }
    all.push(...data)
    if (data.length < PAGE) break
  }
  return all
}

async function main() {
  // book price
  const { data: books } = await supabase
    .from('books')
    .select('id, title_1, price, is_visible, sort_order')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  const book = (books ?? [])[0]
  const bookPrice = book ? Number(String(book.price).replace(/[^0-9.]/g, '')) : NaN
  if (!book || !Number.isFinite(bookPrice) || bookPrice <= 0) {
    console.error('No usable book price found in `books` table. Aborting.')
    process.exit(1)
  }
  const bookItem = { type: 'book', id: book.id, title: book.title_1 }
  console.log(`Book price: ₹${bookPrice}  (${book.title_1})`)

  // salesperson
  const { data: sp } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', SALESPERSON_EMAIL)
    .single()
  if (!sp) {
    console.error(`Sales person profile (${SALESPERSON_EMAIL}) not found.`)
    process.exit(1)
  }
  const salespersonId = sp.id

  // 1) delete the stray 21-Jul book interaction(s)
  const { data: deleted, error: delErr } = await supabase
    .from('interactions')
    .delete()
    .eq('category', 'book')
    .gte('call_at', DELETE_DAY_START)
    .lt('call_at', DELETE_DAY_END)
    .select('customer_id')
  if (delErr) {
    console.error('Failed deleting existing 21-Jul interactions:', delErr.message)
    process.exit(1)
  }
  const touchedCustomerIds = [...new Set((deleted ?? []).map((d) => d.customer_id))]
  console.log(`Deleted ${deleted?.length ?? 0} existing 21-Jul book interaction(s).`)

  // 2) parse CSV rows on/after cutoff
  const lines = fs.readFileSync(CSV_PATH, 'utf8').split(/\r?\n/)
  const rows = []
  for (const line of lines) {
    const f = line.split(',')
    const d = parseDateParts(f[1])
    if (!d) continue
    if (d.ymd < CUTOFF) continue
    const phone = normalizePhone(f[3])
    if (!phone) continue
    const orderRaw = (f[f.length - 1] ?? '').trim()
    const qty = orderRaw === '' ? 0 : parseInt(orderRaw, 10)
    rows.push({ name: (f[2] ?? '').trim(), phone, dateISO: d.iso, qty: Number.isFinite(qty) ? qty : 0 })
  }
  const purchases = rows.filter((r) => r.qty >= 1).length
  console.log(`Parsed ${rows.length} rows on/after ${CUTOFF} (${purchases} purchases, ${rows.length - purchases} inquiries).`)
  if (dateWarnings.length) {
    console.log('Date corrections:')
    for (const w of dateWarnings) console.log('  -', w)
  }
  if (rows.length === 0) {
    console.log('Nothing to import.')
    return
  }

  // existing DB state
  const existing = await fetchAllCustomers()
  const phoneToId = new Map(existing.map((c) => [c.phone, c.id]))
  let autoMax = 0
  for (const c of existing) {
    const m = String(c.name ?? '').match(/^Customer[-\s]?(\d+)$/i)
    if (m) autoMax = Math.max(autoMax, +m[1])
  }
  console.log(`Existing customers: ${existing.length}. Auto-name continues from Customer-${autoMax + 1}.`)

  // unique phones in these rows (first-seen name wins)
  const seen = new Map()
  for (const r of rows) if (!seen.has(r.phone)) seen.set(r.phone, r.name)

  // customers to create = phones not already in DB
  const toCreate = []
  let nextAuto = autoMax + 1
  let autoAssigned = 0
  for (const [phone, name] of seen) {
    if (phoneToId.has(phone)) continue
    const hasName = name.length > 0
    const finalName = hasName ? name : `Customer-${nextAuto++}`
    if (!hasName) autoAssigned++
    toCreate.push({ phone, name: finalName, is_auto_named: !hasName, created_by: salespersonId })
  }
  for (let i = 0; i < toCreate.length; i += 200) {
    const batch = toCreate.slice(i, i + 200)
    const { data, error } = await supabase.from('customers').insert(batch).select('id, phone')
    if (error) {
      console.error('customer insert error:', error.message)
      process.exit(1)
    }
    for (const row of data) phoneToId.set(row.phone, row.id)
  }
  console.log(`Created ${toCreate.length} new customers (reused ${seen.size - toCreate.length} existing). Auto-named ${autoAssigned}.`)

  // 3) insert interactions
  const interactionRows = rows.map((r) => {
    const isPurchase = r.qty >= 1
    return {
      customer_id: phoneToId.get(r.phone),
      category: 'book',
      items: isPurchase ? [bookItem] : [],
      notes: null,
      call_type: isPurchase ? 'purchase' : 'inquiry',
      amount: isPurchase ? bookPrice * r.qty : null,
      call_at: r.dateISO,
      created_by: salespersonId,
    }
  })
  let inserted = 0
  for (let i = 0; i < interactionRows.length; i += 500) {
    const batch = interactionRows.slice(i, i + 500)
    const { error } = await supabase.from('interactions').insert(batch)
    if (error) {
      console.error('interaction insert error:', error.message)
      process.exit(1)
    }
    inserted += batch.length
  }
  console.log(`Inserted ${inserted} interactions.`)

  // cleanup: any customer left orphaned by the step-1 delete
  let orphansRemoved = 0
  for (const cid of touchedCustomerIds) {
    const { count } = await supabase
      .from('interactions')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', cid)
    if ((count ?? 0) === 0) {
      await supabase.from('customers').delete().eq('id', cid)
      orphansRemoved++
    }
  }
  if (orphansRemoved) console.log(`Removed ${orphansRemoved} orphaned customer(s).`)

  console.log('\nDone.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
