/**
 * Appends a monthly "ONLINE CLASS STATUS REPORT" CSV into the Sales Register.
 * Does NOT clear existing data.
 *
 * Run from the `frontend/` folder:
 *   node scripts/import-online-class.mjs "public/import-data/ONLINE CLASS STATUS REPORT - July-2026.csv"
 *
 * Columns (1-based): S NO(1, ignored), DATE(2), NAME(3), PHONE(4),
 *                    JOINING STATUS(5), RECEIVED AMOUNT(6).
 *
 * Rules:
 *   - JOINING STATUS = joined/jointed(typo) -> purchase; amount = RECEIVED AMOUNT.
 *     Anything else (nill/nil/nii/empty) -> inquiry (no amount).
 *   - Online class has no dedicated category, so it is stored under `video_course`.
 *     The video_courses catalog table is empty, so `items` is always left [].
 *   - Phone is the customer key (reuse existing, else create; empty name ->
 *     Customer-N continuing from the DB max). All rows -> "Sales person".
 *   - Dates accept dd/mm/yyyy with '.', '-' or '/' separators (May has typos like
 *     "30.05.2026" and "31-05/2026"); any non-2026 year is corrected to 2026.
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const CSV_PATH = process.argv[2] || 'public/import-data/ONLINE CLASS STATUS REPORT - July-2026.csv'
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
const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim()

function normalizePhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits
}

// joined / jointed(typo) -> purchase. everything else -> inquiry.
function isJoinedStatus(raw) {
  const s = clean(raw).toLowerCase().replace(/\s+/g, '')
  return s === 'joined' || s === 'jointed'
}

const dateWarnings = []
function parseDate(raw) {
  const m = String(raw ?? '').trim().match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/)
  if (!m) return null
  let [full, dd, mm, yyyy] = m
  if (+yyyy !== EXPECTED_YEAR) {
    dateWarnings.push(`${full} -> ${EXPECTED_YEAR}`)
    yyyy = String(EXPECTED_YEAR)
  } else if (/[.-]/.test(full)) {
    dateWarnings.push(`${full} -> normalized separators`)
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
  const rows = [] // { name, phone, dateISO, isPurchase, amount }
  let joinedNoAmount = 0
  let amountNotJoined = 0
  for (const line of lines) {
    const f = line.split(',')
    const dateISO = parseDate(f[1])
    if (!dateISO) continue
    const phone = normalizePhone(f[3])
    if (!phone) continue
    const joined = isJoinedStatus(f[4])
    const amountRaw = String(f[5] ?? '').replace(/[^0-9.]/g, '')
    const amount = amountRaw ? Number(amountRaw) : null
    const hasAmount = Number.isFinite(amount) && amount > 0
    let isPurchase = joined && hasAmount
    if (joined && !hasAmount) joinedNoAmount++       // joined but blank amount -> inquiry (logged)
    if (!joined && hasAmount) amountNotJoined++       // amount but not joined -> inquiry (logged)
    rows.push({ name: clean(f[2]), phone, dateISO, isPurchase, amount: isPurchase ? amount : null })
  }
  const purchases = rows.filter((r) => r.isPurchase).length
  console.log(`Parsed ${rows.length} rows (${purchases} purchases, ${rows.length - purchases} inquiries).`)
  if (joinedNoAmount) console.log(`  (${joinedNoAmount} rows marked joined but had no amount -> treated as inquiries)`)
  if (amountNotJoined) console.log(`  (${amountNotJoined} rows had an amount but status not joined -> treated as inquiries)`)
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
    category: 'video_course',
    items: [],
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
