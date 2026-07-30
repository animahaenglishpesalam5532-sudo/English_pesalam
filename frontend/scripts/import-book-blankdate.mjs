/**
 * One-off: import the book rows at the tail of
 * "BOOK STATUS REPORT - July - 2026 (1).csv" whose ENQUIRY DATE column was left
 * blank (S NO 723-744). They were skipped by the date-required importers.
 * Per the sheet owner, they belong to 29/07/2026.
 *
 * Only rows with an empty date AND a phone are taken (the trailing all-empty
 * padding rows are ignored). qty>=1 -> purchase, else inquiry. Reuse customer by
 * phone. Attributed to salesperson@gmail.com.
 *
 * Run from frontend/:  node scripts/import-book-blankdate.mjs
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const CSV_PATH = 'public/import-data/BOOK STATUS REPORT - July - 2026 (1).csv'
const SALESPERSON_EMAIL = 'salesperson@gmail.com'
const ASSIGN_ISO = new Date(Date.UTC(2026, 6, 29, 12, 0, 0)).toISOString() // 29 Jul 2026

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

function normalizePhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}
const isDate = (s) => /^\d{2}\/\d{2}\/\d{4}$/.test(String(s ?? '').trim())

async function fetchAllCustomers() {
  const all = []
  const PAGE = 1000
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from('customers').select('id, phone, name').range(from, from + PAGE - 1)
    if (error) { console.error(error.message); process.exit(1) }
    all.push(...data)
    if (data.length < PAGE) break
  }
  return all
}

async function main() {
  const { data: books } = await supabase
    .from('books').select('id, title_1, price, is_visible, sort_order')
    .eq('is_visible', true).order('sort_order', { ascending: true }).order('created_at', { ascending: true })
  const book = (books ?? [])[0]
  const bookPrice = book ? Number(String(book.price).replace(/[^0-9.]/g, '')) : NaN
  if (!book || !Number.isFinite(bookPrice) || bookPrice <= 0) { console.error('No usable book price.'); process.exit(1) }
  const bookItem = { type: 'book', id: book.id, title: book.title_1 }
  console.log(`Book price: ₹${bookPrice} (${book.title_1})`)

  const { data: sp } = await supabase.from('profiles').select('id').eq('email', SALESPERSON_EMAIL).single()
  if (!sp) { console.error(`Sales person (${SALESPERSON_EMAIL}) not found.`); process.exit(1) }
  const salespersonId = sp.id

  const lines = fs.readFileSync(CSV_PATH, 'utf8').split(/\r?\n/)
  const rows = []
  for (const line of lines) {
    const f = line.split(',')
    if (isDate(f[1])) continue        // skip normal dated rows
    const phone = normalizePhone(f[3])
    if (!phone) continue              // skip empty padding rows
    const order = (f[4] ?? '').trim()
    const qty = order === '' ? 0 : parseInt(order, 10)
    rows.push({ name: (f[2] ?? '').trim(), phone, qty: Number.isFinite(qty) ? qty : 0 })
  }
  const purchases = rows.filter((r) => r.qty >= 1).length
  console.log(`Blank-date rows with a phone: ${rows.length} (${purchases} purchases, ${rows.length - purchases} inquiries) -> assigning ${ASSIGN_ISO.slice(0, 10)}.`)
  for (const r of rows) console.log(`   ${r.qty >= 1 ? 'BUY ' : 'inq '} ${r.phone}  ${r.name}`)
  if (rows.length === 0) { console.log('Nothing to import.'); return }

  const existing = await fetchAllCustomers()
  const phoneToId = new Map(existing.map((c) => [c.phone, c.id]))
  let autoMax = 0
  for (const c of existing) { const m = String(c.name ?? '').match(/^Customer[-\s]?(\d+)$/i); if (m) autoMax = Math.max(autoMax, +m[1]) }

  const seen = new Map()
  for (const r of rows) if (!seen.has(r.phone)) seen.set(r.phone, r.name)
  let nextAuto = autoMax + 1
  const toCreate = []
  for (const [phone, name] of seen) {
    if (phoneToId.has(phone)) continue
    const hasName = name.length > 0
    toCreate.push({ phone, name: hasName ? name : `Customer-${nextAuto++}`, is_auto_named: !hasName, created_by: salespersonId })
  }
  for (let i = 0; i < toCreate.length; i += 200) {
    const batch = toCreate.slice(i, i + 200)
    const { data, error } = await supabase.from('customers').insert(batch).select('id, phone')
    if (error) { console.error('customer insert error:', error.message); process.exit(1) }
    for (const row of data) phoneToId.set(row.phone, row.id)
  }
  console.log(`Created ${toCreate.length} new customers (reused ${seen.size - toCreate.length} existing).`)

  const interactionRows = rows.map((r) => {
    const isPurchase = r.qty >= 1
    return {
      customer_id: phoneToId.get(r.phone),
      category: 'book',
      items: isPurchase ? [bookItem] : [],
      notes: null,
      call_type: isPurchase ? 'purchase' : 'inquiry',
      amount: isPurchase ? bookPrice * r.qty : null,
      call_at: ASSIGN_ISO,
      created_by: salespersonId,
    }
  })
  const { error } = await supabase.from('interactions').insert(interactionRows)
  if (error) { console.error('interaction insert error:', error.message); process.exit(1) }
  console.log(`Inserted ${interactionRows.length} interactions.`)
  console.log('\nDone.')
}

main().catch((e) => { console.error(e); process.exit(1) })
