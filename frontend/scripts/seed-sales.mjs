/**
 * Seeds realistic test data for the Sales Register / Sales Entry feature.
 * Run from the `frontend/` folder:  node scripts/seed-sales.mjs
 *
 * Uses the service-role key (bypasses RLS). Test rows are tagged so they can
 * be removed later — see the cleanup note printed at the end.
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// --- load env from .env.local ---------------------------------------------
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
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1))
const chance = (p) => Math.random() < p
const round = (n) => Math.round(n)

const NAMES = [
  'Rajesh Kumar', 'Priya Sharma', 'Anand Raj', 'Meena Kumari', 'Suresh Babu',
  'Divya Nair', 'Karthik R', 'Lakshmi Devi', 'Vijay Anand', 'Deepa Menon',
  'Arjun Das', 'Sneha Pillai', 'Ramesh Iyer', 'Kavya Reddy', 'Manoj Kumar',
  'Fathima Beevi', 'Gopal Krishna', 'Nithya Balan', 'Hari Prasad', 'Revathi S',
  'Sathish Kumar', 'Anjali Menon', 'Prakash R', 'Bhavana Nair', 'Naveen Raj',
]
const NOTES = [
  'Asked about delivery time', 'Wants combo offer', 'Interested, will call back',
  'Requested demo', 'Comparing with other books', 'Bulk order enquiry',
  'Asked for discount', 'Happy with the product', 'Needs Tamil medium version',
  'Follow up next week', null, null, null,
]

async function main() {
  // 1) Ensure a couple of test staff exist (so charts show multiple salespeople)
  const staffToCreate = [
    { email: 'ravi.sales@test.com', full_name: 'Ravi (Test Staff)', password: 'Test@1234' },
    { email: 'anu.sales@test.com', full_name: 'Anu (Test Staff)', password: 'Test@1234' },
  ]
  for (const s of staffToCreate) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: s.email,
      password: s.password,
      email_confirm: true,
      user_metadata: { full_name: s.full_name },
    })
    if (error) {
      if (!/already/i.test(error.message)) console.warn('  staff create:', s.email, error.message)
      continue
    }
    await supabase.from('profiles').insert({
      id: data.user.id,
      email: s.email,
      full_name: s.full_name,
      role: 'staff',
      is_active: true,
    })
    console.log('  created staff', s.email, '/ password:', s.password)
  }

  // 2) Load profiles (created_by) and products (items)
  const [{ data: profiles }, { data: books }, { data: pdfs }, { data: ppts }, { data: videos }] =
    await Promise.all([
      supabase.from('profiles').select('id'),
      supabase.from('books').select('id, title_1'),
      supabase.from('pdfs').select('id, name'),
      supabase.from('ppts').select('id, name'),
      supabase.from('video_courses').select('id, name'),
    ])

  const profileIds = (profiles ?? []).map((p) => p.id)
  if (profileIds.length === 0) {
    console.error('No profiles found — run the admin seed SQL first.')
    process.exit(1)
  }

  const bookItems = (books ?? []).map((b) => ({ type: 'book', id: b.id, title: b.title_1 }))
  const pdfItems = (pdfs ?? []).map((p) => ({ type: 'pdf', id: p.id, title: p.name }))
  const pptItems = (ppts ?? []).map((p) => ({ type: 'ppt', id: p.id, title: p.name }))
  const videoItems = (videos ?? []).map((v) => ({ type: 'video_course', id: v.id, title: v.name }))

  const pickSome = (pool, max) => {
    if (pool.length === 0) return []
    const n = randInt(1, Math.min(max, pool.length))
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, n)
  }

  // 3) Create customers (unique phones). ~30% "unknown" -> Customer-N (high base to avoid clashing with live sequence)
  const NUM_CUSTOMERS = 220
  const phones = new Set()
  let autoN = 1001
  const customerRows = []
  while (customerRows.length < NUM_CUSTOMERS) {
    const phone = '9' + randInt(100000000, 999999999)
    if (phones.has(phone)) continue
    phones.add(phone)
    const auto = chance(0.3)
    customerRows.push({
      phone,
      name: auto ? `Customer-${autoN++}` : rand(NAMES),
      is_auto_named: auto,
      created_by: rand(profileIds),
    })
  }

  const insertedCustomers = []
  for (let i = 0; i < customerRows.length; i += 200) {
    const batch = customerRows.slice(i, i + 200)
    const { data, error } = await supabase.from('customers').insert(batch).select('id')
    if (error) {
      console.error('customer insert error:', error.message)
      process.exit(1)
    }
    insertedCustomers.push(...data)
  }
  console.log(`  inserted ${insertedCustomers.length} customers`)

  // 4) Create interactions as realistic customer JOURNEYS.
  //    e.g. a person enquires on day 1, 3, 4 ... then purchases on day 5.
  //    Each customer sticks to one product category across their journey and is
  //    usually handled by the same salesperson (with occasional handoffs).
  const CATEGORIES = ['general', 'book', 'pdf_ppt', 'video_course']
  const now = Date.now()
  const DAY = 24 * 60 * 60 * 1000

  const priceFor = (category) => {
    if (category === 'book') return round(randInt(250, 750))
    if (category === 'pdf_ppt') return round(randInt(99, 499))
    if (category === 'video_course') return round(randInt(1999, 4999))
    return round(randInt(199, 999))
  }
  const itemsFor = (category) => {
    if (category === 'book') return pickSome(bookItems, 2)
    if (category === 'pdf_ppt') return [...pickSome(pdfItems, 2), ...pickSome(pptItems, 1)]
    if (category === 'video_course') return pickSome(videoItems, 1)
    return []
  }
  // A random time-of-day offset (business hours-ish) within a given day
  const atTimeOfDay = (baseMs) =>
    baseMs + (9 + Math.random() * 10) * 60 * 60 * 1000 + Math.floor(Math.random() * 60) * 60 * 1000

  const interactionRows = []
  for (const c of insertedCustomers) {
    const category = rand(CATEGORIES)
    const owner = rand(profileIds) // primary salesperson for this customer

    // When did this customer's journey start? 60% within last 45 days.
    const startDaysAgo = chance(0.6) ? randInt(0, 45) : randInt(46, 400)

    // Build a set of ascending "day offsets" for the inquiry calls,
    // e.g. [0, 2, 3] meaning day 1, day 3, day 4 relative to journey start.
    const numInquiries = randInt(1, 5)
    const dayOffsets = []
    let cursor = 0
    for (let k = 0; k < numInquiries; k++) {
      dayOffsets.push(cursor)
      cursor += randInt(1, 3) // 1–3 days between follow-up calls
    }

    // ~55% of journeys convert into a purchase a little after the last inquiry.
    const converts = chance(0.55)
    const purchaseOffset = converts ? cursor + randInt(1, 2) : null

    const pushCall = (offsetDays, isPurchase) => {
      // Journey start is `startDaysAgo` back; later offsets are more recent.
      const dayStartMs = now - (startDaysAgo - offsetDays) * DAY
      // Guard: never place a call in the future.
      const callMs = Math.min(atTimeOfDay(dayStartMs - DAY), now - 60 * 1000)
      interactionRows.push({
        customer_id: c.id,
        category,
        items: isPurchase || category !== 'general' ? itemsFor(category) : [],
        notes: rand(NOTES),
        call_type: isPurchase ? 'purchase' : 'inquiry',
        amount: isPurchase ? priceFor(category) : null,
        call_at: new Date(callMs).toISOString(),
        created_by: chance(0.85) ? owner : rand(profileIds),
      })
    }

    for (const off of dayOffsets) pushCall(off, false)
    if (purchaseOffset != null) pushCall(purchaseOffset, true)
  }

  // Ensure we always seed at least 1000 records — top up with extra standalone
  // calls spread over the last ~13 months if journeys produced fewer.
  while (interactionRows.length < 1000) {
    const c = rand(insertedCustomers)
    const category = rand(CATEGORIES)
    const isPurchase = chance(0.32)
    const daysAgo = chance(0.65) ? Math.random() * 45 : 45 + Math.random() * 355
    interactionRows.push({
      customer_id: c.id,
      category,
      items: isPurchase || category !== 'general' ? itemsFor(category) : [],
      notes: rand(NOTES),
      call_type: isPurchase ? 'purchase' : 'inquiry',
      amount: isPurchase ? priceFor(category) : null,
      call_at: new Date(now - daysAgo * DAY - Math.random() * DAY).toISOString(),
      created_by: rand(profileIds),
    })
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
  console.log(`  inserted ${inserted} interactions`)

  // Record what we created so cleanup can remove exactly this data.
  // Merge with any existing manifest so earlier seed runs stay tracked too.
  let prev = { customerIds: [], staffEmails: [] }
  try {
    prev = JSON.parse(fs.readFileSync('scripts/.seed-manifest.json', 'utf8'))
  } catch {}
  fs.writeFileSync(
    'scripts/.seed-manifest.json',
    JSON.stringify(
      {
        customerIds: [...new Set([...(prev.customerIds ?? []), ...insertedCustomers.map((c) => c.id)])],
        staffEmails: [...new Set([...(prev.staffEmails ?? []), ...staffToCreate.map((s) => s.email)])],
      },
      null,
      2
    )
  )

  console.log('\nDone. Test staff logins: ravi.sales@test.com / anu.sales@test.com  (password: Test@1234)')
  console.log('Cleanup later with:  node scripts/cleanup-sales.mjs')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
