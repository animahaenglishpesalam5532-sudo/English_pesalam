/**
 * One-off: import the PDF rows that were skipped due to date typos in
 * "PDF STATUS REPORT - JULY-2026 (1).csv":
 *   - "25/04/2026" (April typo) -> 25/07/2026   (3 rows, skipped as pre-cutoff)
 *   - "2707/2026"  (missing '/') -> 27/07/2026   (6 rows, failed date parsing)
 *
 * Same product mapping as import-pdf-ppt.mjs. Reuse customer by phone.
 * Attributed to salesperson@gmail.com.
 *
 * Run from frontend/:  node scripts/import-pdf-datefix.mjs
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const CSV_PATH = 'public/import-data/PDF STATUS REPORT - JULY-2026 (1).csv'
const SALESPERSON_EMAIL = 'salesperson@gmail.com'

// map the exact typo'd date strings -> corrected yyyy-mm-dd
const DATE_FIX = {
  '25/04/2026': '2026-07-25',
  '2707/2026': '2026-07-27',
}

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
const PRODUCT_MAP = {
  'ALL PDF': [{ type: 'pdf', id: null, title: 'ALL PDF Bundle' }],
  '30 DAYS CLASS': [PDF.days30],
  '500 VERBS': [PDF.verbs],
  '2000 SENTENCES': [PDF.sentences],
  '7 DAYS CLASS': [PDF.days7],
  '15 DAYS CLASS': [PPT.basic10, PPT.days5],
}

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()
function normalizePhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}
function isoFor(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).toISOString()
}
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
  const { data: sp } = await supabase.from('profiles').select('id').eq('email', SALESPERSON_EMAIL).single()
  if (!sp) { console.error(`Sales person (${SALESPERSON_EMAIL}) not found.`); process.exit(1) }
  const salespersonId = sp.id

  const lines = fs.readFileSync(CSV_PATH, 'utf8').split(/\r?\n/)
  const rows = []
  for (const line of lines) {
    const f = line.split(',')
    const rawDate = String(f[1] ?? '').trim()
    const ymd = DATE_FIX[rawDate]
    if (!ymd) continue
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
    rows.push({ name: clean(f[2]), phone, ymd, iso: isoFor(ymd), product, amount, isPurchase })
  }
  const purchases = rows.filter((r) => r.isPurchase).length
  console.log(`Date-fix rows: ${rows.length} (${purchases} purchases, ${rows.length - purchases} inquiries).`)
  for (const r of rows) console.log(`   ${r.ymd}  ${r.isPurchase ? 'BUY ' : 'inq '} ${r.phone}  ${r.name}  ${r.isPurchase ? '[' + r.product + ' ' + r.amount + ']' : ''}`)
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

  const interactionRows = rows.map((r) => ({
    customer_id: phoneToId.get(r.phone),
    category: 'pdf_ppt',
    items: r.isPurchase ? PRODUCT_MAP[r.product] ?? [] : [],
    notes: null,
    call_type: r.isPurchase ? 'purchase' : 'inquiry',
    amount: r.isPurchase ? r.amount : null,
    call_at: r.iso,
    created_by: salespersonId,
  }))
  const { error } = await supabase.from('interactions').insert(interactionRows)
  if (error) { console.error('interaction insert error:', error.message); process.exit(1) }
  console.log(`Inserted ${interactionRows.length} interactions.`)
  console.log('\nDone.')
}

main().catch((e) => { console.error(e); process.exit(1) })
