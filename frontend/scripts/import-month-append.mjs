/**
 * Appends a monthly "BOOK STATUS REPORT" CSV into the Sales Register.
 * Does NOT clear existing data (unlike import-book-status.mjs).
 *
 * Run from the `frontend/` folder:
 *   node scripts/import-month-append.mjs "<csv path>" [qtyColumn]
 *   e.g. node scripts/import-month-append.mjs "public/import-data/BOOK STATUS REPORT - JUNE-2026.csv"
 *        node scripts/import-month-append.mjs "public/import-data/BOOK STATUS REPORT - MAY -2026.csv" 7
 *
 * Columns are fixed: S NO(1), DATE(2), NAME(3), PHONE(4). ORDER QTY defaults to
 * the LAST field of each row; pass [qtyColumn] (1-based) to point at it explicitly
 * when the sheet has extra columns to ignore (e.g. May's ORDER STATUS / ORDER DATE).
 *
 * Rules:
 *   - Phone is the customer key. If it already exists in the DB, reuse that
 *     customer and just add the interaction (no duplicate customer).
 *   - Empty name  -> "Customer-N", where N continues from the DB's current max.
 *   - order qty >= 1 -> purchase (amount = qty * book price, item = the book)
 *     order empty     -> inquiry  (no amount)
 *   - dd/mm/yyyy dates; any non-2026 year is treated as a typo -> 2026 (logged).
 *   - All rows are attributed to the "Sales person" staff account.
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const CSV_PATH = process.argv[2] || 'public/import-data/BOOK STATUS REPORT - JUNE-2026.csv'
const QTY_COL = process.argv[3] ? parseInt(process.argv[3], 10) - 1 : null // 0-based; null = last field
const SALESPERSON_EMAIL = 'salesperson@englishpesalam.com'
const EXPECTED_YEAR = 2026

// --- env -------------------------------------------------------------------
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

// --- helpers ---------------------------------------------------------------
function normalizePhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}

const dateWarnings = []
function parseDate(raw) {
  const m = String(raw ?? '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  let [, dd, mm, yyyy] = m
  if (+yyyy !== EXPECTED_YEAR) {
    dateWarnings.push(`${dd}/${mm}/${yyyy} -> year corrected to ${EXPECTED_YEAR}`)
    yyyy = String(EXPECTED_YEAR)
  }
  return new Date(Date.UTC(+yyyy, +mm - 1, +dd, 12, 0, 0)).toISOString()
}

async function fetchAllCustomers() {
  const all = []
  const PAGE = 1000
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('customers')
      .select('id, phone, name, is_auto_named')
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
    console.error(`Sales person profile (${SALESPERSON_EMAIL}) not found. Run the July import first.`)
    process.exit(1)
  }
  const salespersonId = sp.id

  // parse CSV
  const lines = fs.readFileSync(CSV_PATH, 'utf8').split(/\r?\n/)
  const rows = [] // { name, phone, dateISO, qty }
  for (const line of lines) {
    const f = line.split(',')
    const dateISO = parseDate(f[1])
    if (!dateISO) continue
    const phone = normalizePhone(f[3])
    if (!phone) continue
    const orderRaw = (f[QTY_COL == null ? f.length - 1 : QTY_COL] ?? '').trim()
    const qty = orderRaw === '' ? 0 : parseInt(orderRaw, 10)
    rows.push({ name: (f[2] ?? '').trim(), phone, dateISO, qty: Number.isFinite(qty) ? qty : 0 })
  }
  const purchases = rows.filter((r) => r.qty >= 1).length
  console.log(`Parsed ${rows.length} rows (${purchases} purchases, ${rows.length - purchases} inquiries).`)
  if (dateWarnings.length) {
    console.log('Date corrections:')
    for (const w of dateWarnings) console.log('  -', w)
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

  // unique phones in this CSV (first-seen name wins)
  const seen = new Map()
  for (const r of rows) if (!seen.has(r.phone)) seen.set(r.phone, r.name)

  // customers to create = phones not already in DB
  const toCreate = []
  let nextAuto = autoMax + 1
  const assignedAuto = []
  for (const [phone, name] of seen) {
    if (phoneToId.has(phone)) continue
    const hasName = name.length > 0
    const finalName = hasName ? name : `Customer-${nextAuto++}`
    if (!hasName) assignedAuto.push(finalName)
    toCreate.push({ phone, name: finalName, is_auto_named: !hasName, created_by: salespersonId })
  }

  // insert new customers
  for (let i = 0; i < toCreate.length; i += 200) {
    const batch = toCreate.slice(i, i + 200)
    const { data, error } = await supabase.from('customers').insert(batch).select('id, phone')
    if (error) {
      console.error('customer insert error:', error.message)
      process.exit(1)
    }
    for (const row of data) phoneToId.set(row.phone, row.id)
  }
  console.log(`Created ${toCreate.length} new customers (reused ${seen.size - toCreate.length} existing).`)
  if (assignedAuto.length) {
    console.log(`Auto-named ${assignedAuto.length}: ${assignedAuto[0]} .. ${assignedAuto[assignedAuto.length - 1]}`)
  }

  // insert interactions for every CSV row
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
  console.log('\nDone.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
