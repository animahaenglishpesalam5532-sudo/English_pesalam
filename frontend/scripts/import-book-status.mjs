/**
 * One-time migration: clears the dummy Sales Register data and imports the
 * real July 2026 "BOOK STATUS REPORT" CSV.
 *
 * Run from the `frontend/` folder:  node scripts/import-book-status.mjs
 *
 * What it does:
 *   1. Reads the standard book price from the `books` table (e.g. 339).
 *   2. Deletes all interaction_edits, interactions, customers.
 *   3. Deletes all STAFF logins (auth users + profiles). Keeps admin.
 *   4. Creates one staff "Sales person" (login: salesperson / password below).
 *   5. Imports each CSV row -> customer (unique phone) + interaction.
 *        order qty = 1  -> purchase (amount = book price, item = the book)
 *        order empty    -> inquiry  (no amount)
 *
 * Uses the service-role key (bypasses RLS).
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// --- config ----------------------------------------------------------------
const CSV_PATH = 'public/import-data/BOOK STATUS REPORT - July - 2026.csv'
const LOGIN_DOMAIN = 'englishpesalam.com'
const SALESPERSON = {
  email: `salesperson@${LOGIN_DOMAIN}`,
  password: 'sNcGhszd',
  full_name: 'Sales person',
}

// --- load env from .env.local ----------------------------------------------
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
// Normalize an Indian phone number to 10 digits where possible.
function normalizePhone(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1)
  return digits // 10-digit as-is; short/odd imported as-is (per instruction)
}

// dd/mm/yyyy -> ISO timestamp at 12:00 UTC (avoids timezone date-shift).
function parseDate(raw) {
  const m = String(raw ?? '').trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const [, dd, mm, yyyy] = m
  return new Date(Date.UTC(+yyyy, +mm - 1, +dd, 12, 0, 0)).toISOString()
}

async function main() {
  // 1) ------------------------------------------------------------------ book price
  const { data: books, error: bookErr } = await supabase
    .from('books')
    .select('id, title_1, price, is_visible, sort_order')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
  if (bookErr) {
    console.error('Could not read books:', bookErr.message)
    process.exit(1)
  }
  const book = (books ?? [])[0]
  const bookPrice = book ? Number(String(book.price).replace(/[^0-9.]/g, '')) : NaN
  if (!book || !Number.isFinite(bookPrice) || bookPrice <= 0) {
    console.error('No usable book price found in `books` table. Aborting.')
    process.exit(1)
  }
  const bookItem = { type: 'book', id: book.id, title: book.title_1 }
  console.log(`Book price: ₹${bookPrice}  (${book.title_1})`)

  // 2) ------------------------------------------------------------------ parse CSV
  const raw = fs.readFileSync(CSV_PATH, 'utf8')
  const lines = raw.split(/\r?\n/)
  const parsed = [] // { name, phone, dateISO, isPurchase }
  const skipped = []
  for (const line of lines) {
    const f = line.split(',')
    const dateISO = parseDate(f[1]) // field 2 must be a dd/mm/yyyy date
    if (!dateISO) continue // header lines / empty padding rows are skipped
    const name = (f[2] ?? '').trim()
    const phone = normalizePhone(f[3])
    const order = (f[4] ?? '').trim()
    if (!phone) {
      skipped.push({ reason: 'no phone', line })
      continue
    }
    parsed.push({ name, phone, dateISO, isPurchase: order === '1' })
  }
  console.log(`Parsed ${parsed.length} data rows (${skipped.length} skipped).`)

  // Dedup into customers (first occurrence wins for the name).
  let autoSeq = 9001
  const byPhone = new Map()
  for (const r of parsed) {
    if (!byPhone.has(r.phone)) {
      const hasName = r.name.length > 0
      byPhone.set(r.phone, {
        phone: r.phone,
        name: hasName ? r.name : `Customer-${autoSeq++}`,
        is_auto_named: !hasName,
        interactions: [],
      })
    }
    byPhone.get(r.phone).interactions.push(r)
  }
  const customers = [...byPhone.values()]
  const totalInteractions = parsed.length
  const purchases = parsed.filter((r) => r.isPurchase).length
  console.log(
    `-> ${customers.length} unique customers, ${totalInteractions} interactions ` +
      `(${purchases} purchases, ${totalInteractions - purchases} inquiries).`
  )

  // 3) ------------------------------------------------------ clear existing data
  console.log('Clearing existing interaction_edits / interactions / customers ...')
  for (const t of ['interaction_edits', 'interactions', 'customers']) {
    const { error } = await supabase.from(t).delete().not('id', 'is', null)
    if (error) {
      console.error(`Failed clearing ${t}:`, error.message)
      process.exit(1)
    }
  }

  // Delete staff logins (auth users cascade-delete their profile). Keep admin.
  const { data: staffProfiles, error: spErr } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('role', 'staff')
  if (spErr) {
    console.error('Could not read staff profiles:', spErr.message)
    process.exit(1)
  }
  for (const p of staffProfiles ?? []) {
    const { error } = await supabase.auth.admin.deleteUser(p.id)
    if (error && !/not found/i.test(error.message)) {
      console.warn(`  could not delete staff auth user ${p.email}:`, error.message)
    }
  }
  console.log(`Deleted ${staffProfiles?.length ?? 0} staff login(s). Admin kept.`)

  // 4) ------------------------------------------------------ create "Sales person"
  let salespersonId
  {
    const { data, error } = await supabase.auth.admin.createUser({
      email: SALESPERSON.email,
      password: SALESPERSON.password,
      email_confirm: true,
      user_metadata: { full_name: SALESPERSON.full_name },
    })
    if (error) {
      if (/already/i.test(error.message)) {
        // Fetch existing user by listing (small user base).
        const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
        const found = list?.users?.find((u) => u.email === SALESPERSON.email)
        if (!found) {
          console.error('Sales person exists but could not be located.')
          process.exit(1)
        }
        salespersonId = found.id
        await supabase.auth.admin.updateUserById(salespersonId, { password: SALESPERSON.password })
      } else {
        console.error('Could not create Sales person:', error.message)
        process.exit(1)
      }
    } else {
      salespersonId = data.user.id
    }
  }
  const { error: profErr } = await supabase.from('profiles').upsert({
    id: salespersonId,
    email: SALESPERSON.email,
    full_name: SALESPERSON.full_name,
    role: 'staff',
    is_active: true,
  })
  if (profErr) {
    console.error('Could not upsert Sales person profile:', profErr.message)
    process.exit(1)
  }
  console.log(`Sales person ready (login: salesperson / ${SALESPERSON.password}).`)

  // 5) ------------------------------------------------------ insert customers
  const customerRows = customers.map((c) => ({
    phone: c.phone,
    name: c.name,
    is_auto_named: c.is_auto_named,
    created_by: salespersonId,
  }))
  const phoneToId = new Map()
  for (let i = 0; i < customerRows.length; i += 200) {
    const batch = customerRows.slice(i, i + 200)
    const { data, error } = await supabase.from('customers').insert(batch).select('id, phone')
    if (error) {
      console.error('customer insert error:', error.message)
      process.exit(1)
    }
    for (const row of data) phoneToId.set(row.phone, row.id)
  }
  console.log(`Inserted ${phoneToId.size} customers.`)

  // ------------------------------------------------------ insert interactions
  const interactionRows = []
  for (const c of customers) {
    const customerId = phoneToId.get(c.phone)
    for (const it of c.interactions) {
      interactionRows.push({
        customer_id: customerId,
        category: 'book',
        items: it.isPurchase ? [bookItem] : [],
        notes: null,
        call_type: it.isPurchase ? 'purchase' : 'inquiry',
        amount: it.isPurchase ? bookPrice : null,
        call_at: it.dateISO,
        created_by: salespersonId,
      })
    }
  }
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
  console.log(`  Login -> username: salesperson   password: ${SALESPERSON.password}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
