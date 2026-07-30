/**
 * Appends the PDF/PPT monthly report (category = pdf_ppt) into the Sales
 * Register. Does NOT clear existing data.
 *
 * Run from the `frontend/` folder:
 *   node scripts/import-pdf-ppt.mjs "public/import-data/PDF STATUS REPORT - JULY-2026.csv"
 *
 * Columns: S NO(1, ignored), DATE(2), NAME(3), PHONE(4),
 *          ORDER STATUS(5, ignored), PRODUCT(6), PURCHASED AMOUNT(7).
 *
 * Rules:
 *   - A PURCHASED AMOUNT present -> purchase. amount = that column (as-is);
 *     items = mapped DB product(s) below.
 *   - No amount -> inquiry (no items), even if a PRODUCT is named (e.g. status
 *     "nill" rows where the caller only asked about a product).
 *   - Phone is the customer key (reuse existing, else create; empty name ->
 *     Customer-N continuing from the DB max). All rows -> "Sales person".
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const CSV_PATH = process.argv[2] || 'public/import-data/PDF STATUS REPORT - JULY-2026.csv'
const SALESPERSON_EMAIL = 'salesperson@englishpesalam.com'
const EXPECTED_YEAR = 2026

// DB product ids (from the pdfs / ppts tables).
const PDF = {
  verbs: { type: 'pdf', id: '5ea825af-31da-425e-9e9e-b17bfaf4186a', title: '500 VERBS ( V1, V2, V3 )' },
  sentences: { type: 'pdf', id: 'f55e6c07-f51b-4ea7-a0d3-f866c7df0807', title: '2000 DAILY USE SENTENCES PDF' },
  days30: { type: 'pdf', id: '18e64d45-d9b8-4a25-b075-d2c01ffb16a9', title: '30 DAYS SPOKEN ENGLISH CLASS PDF' },
  days7: { type: 'pdf', id: '7c6ef043-b396-4367-8bed-b3dea68d5d58', title: '7 DAYS SPOKEN ENGLISH CLASS' },
}
const PPT = {
  basic10: { type: 'ppt', id: 'd20f2d42-a318-4973-9dba-c834558bf67e', title: '10 DAYS BASIC CLASS' },
  days5: { type: 'ppt', id: '0459722e-3cee-47af-9fab-de121cc85aef', title: '5 DAYS CLASS' },
}

// Sheet PRODUCT label -> interaction items. Keys are normalized (upper, single-spaced).
const PRODUCT_MAP = {
  'ALL PDF': [{ type: 'pdf', id: null, title: 'ALL PDF Bundle' }],
  '30 DAYS CLASS': [PDF.days30],
  '500 VERBS': [PDF.verbs],
  '2000 SENTENCES': [PDF.sentences],
  '7 DAYS CLASS': [PDF.days7],
  '15 DAYS CLASS': [PPT.basic10, PPT.days5],
}

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
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()

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
    dateWarnings.push(`${dd}/${mm}/${yyyy} -> ${EXPECTED_YEAR}`)
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

  // parse CSV
  const lines = fs.readFileSync(CSV_PATH, 'utf8').split(/\r?\n/)
  const rows = [] // { name, phone, dateISO, product, amount, isPurchase }
  let inquiryWithProduct = 0
  for (const line of lines) {
    const f = line.split(',')
    const dateISO = parseDate(f[1])
    if (!dateISO) continue
    const phone = normalizePhone(f[3])
    if (!phone) continue
    const product = clean(f[5]).toUpperCase()
    const amountRaw = String(f[6] ?? '').replace(/[^0-9.]/g, '')
    const amount = amountRaw ? Number(amountRaw) : null
    const isPurchase = Number.isFinite(amount) && amount > 0
    if (isPurchase && product && !PRODUCT_MAP[product]) {
      console.error(`Unknown PRODUCT "${product}" on line: ${line}`)
      process.exit(1)
    }
    if (!isPurchase && product) inquiryWithProduct++
    rows.push({ name: clean(f[2]), phone, dateISO, product, amount, isPurchase })
  }
  const purchases = rows.filter((r) => r.isPurchase).length
  console.log(`Parsed ${rows.length} rows (${purchases} purchases, ${rows.length - purchases} inquiries).`)
  if (inquiryWithProduct) console.log(`  (${inquiryWithProduct} inquiries named a product but had no amount -> items left empty)`)
  if (dateWarnings.length) console.log('Date corrections:', dateWarnings.join('; '))

  // existing customers + auto-name max
  const existing = await fetchAllCustomers()
  const phoneToId = new Map(existing.map((c) => [c.phone, c.id]))
  let autoMax = 0
  for (const c of existing) {
    const m = String(c.name ?? '').match(/^Customer[-\s]?(\d+)$/i)
    if (m) autoMax = Math.max(autoMax, +m[1])
  }
  console.log(`Existing customers: ${existing.length}. Auto-name continues from Customer-${autoMax + 1}.`)

  // unique phones (first-seen name)
  const seen = new Map()
  for (const r of rows) if (!seen.has(r.phone)) seen.set(r.phone, r.name)

  let nextAuto = autoMax + 1
  const toCreate = []
  for (const [phone, name] of seen) {
    if (phoneToId.has(phone)) continue
    const hasName = name.length > 0
    toCreate.push({
      phone,
      name: hasName ? name : `Customer-${nextAuto++}`,
      is_auto_named: !hasName,
      created_by: salespersonId,
    })
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
  console.log(`Created ${toCreate.length} new customers (reused ${seen.size - toCreate.length} existing).`)

  // interactions
  const interactionRows = rows.map((r) => ({
    customer_id: phoneToId.get(r.phone),
    category: 'pdf_ppt',
    items: r.isPurchase ? PRODUCT_MAP[r.product] ?? [] : [],
    notes: null,
    call_type: r.isPurchase ? 'purchase' : 'inquiry',
    amount: r.isPurchase ? r.amount : null,
    call_at: r.dateISO,
    created_by: salespersonId,
  }))
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
