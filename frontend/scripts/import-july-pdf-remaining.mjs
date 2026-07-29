/**
 * One-off: import the REMAINING July 2026 PDF/PPT records (>= 21 Jul) from
 * "PDF STATUS REPORT - JULY-2026 (1).csv". The DB already has 01-20 Jul imported;
 * 20-Jul matches the new file exactly (11 rows), so nothing is deleted — this
 * only appends rows dated on/after the cutoff.
 *
 * Same mapping rules as import-pdf-ppt.mjs. Attributed to the current
 * "Sales Person" (salesperson@gmail.com).
 *
 * Run from frontend/:  node scripts/import-july-pdf-remaining.mjs
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const CSV_PATH = 'public/import-data/PDF STATUS REPORT - JULY-2026 (1).csv'
const SALESPERSON_EMAIL = 'salesperson@gmail.com'
const CUTOFF = '2026-07-21' // import rows on/after this date
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
const dateWarnings = []
function parseDateParts(raw) {
  const m = String(raw ?? '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  let [, dd, mm, yyyy] = m
  if (+yyyy !== EXPECTED_YEAR) {
    dateWarnings.push(`${dd}/${mm}/${yyyy} -> ${EXPECTED_YEAR}`)
    yyyy = String(EXPECTED_YEAR)
  }
  return { ymd: `${yyyy}-${mm}-${dd}`, iso: new Date(Date.UTC(+yyyy, +mm - 1, +dd, 12, 0, 0)).toISOString() }
}
async function fetchAllCustomers() {
  const all = []
  const PAGE = 1000
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from('customers').select('id, phone, name').range(from, from + PAGE - 1)
    if (error) { console.error('Could not read customers:', error.message); process.exit(1) }
    all.push(...data)
    if (data.length < PAGE) break
  }
  return all
}

async function main() {
  const { data: sp } = await supabase.from('profiles').select('id').eq('email', SALESPERSON_EMAIL).single()
  if (!sp) { console.error(`Sales person profile (${SALESPERSON_EMAIL}) not found.`); process.exit(1) }
  const salespersonId = sp.id

  const lines = fs.readFileSync(CSV_PATH, 'utf8').split(/\r?\n/)
  const rows = []
  let inquiryWithProduct = 0
  for (const line of lines) {
    const f = line.split(',')
    const d = parseDateParts(f[1])
    if (!d) continue
    if (d.ymd < CUTOFF) continue
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
    rows.push({ name: clean(f[2]), phone, dateISO: d.iso, product, amount, isPurchase })
  }
  const purchases = rows.filter((r) => r.isPurchase).length
  console.log(`Parsed ${rows.length} rows on/after ${CUTOFF} (${purchases} purchases, ${rows.length - purchases} inquiries).`)
  if (inquiryWithProduct) console.log(`  (${inquiryWithProduct} inquiries named a product but had no amount -> items left empty)`)
  if (dateWarnings.length) console.log('Date corrections:', dateWarnings.join('; '))
  if (rows.length === 0) { console.log('Nothing to import.'); return }

  const existing = await fetchAllCustomers()
  const phoneToId = new Map(existing.map((c) => [c.phone, c.id]))
  let autoMax = 0
  for (const c of existing) {
    const m = String(c.name ?? '').match(/^Customer[-\s]?(\d+)$/i)
    if (m) autoMax = Math.max(autoMax, +m[1])
  }
  console.log(`Existing customers: ${existing.length}. Auto-name continues from Customer-${autoMax + 1}.`)

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
    call_at: r.dateISO,
    created_by: salespersonId,
  }))
  let inserted = 0
  for (let i = 0; i < interactionRows.length; i += 500) {
    const batch = interactionRows.slice(i, i + 500)
    const { error } = await supabase.from('interactions').insert(batch)
    if (error) { console.error('interaction insert error:', error.message); process.exit(1) }
    inserted += batch.length
  }
  console.log(`Inserted ${inserted} interactions.`)
  console.log('\nDone.')
}

main().catch((e) => { console.error(e); process.exit(1) })
