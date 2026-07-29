/**
 * One-off: reassign every interaction / customer with a NULL created_by
 * (leftover from the deleted original staff account) to the current
 * "Sales Person" (salesperson@gmail.com), for consistent attribution.
 *
 * Run from frontend/:  node scripts/reassign-null-creator.mjs
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const SALESPERSON_EMAIL = 'salesperson@gmail.com'
const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

async function main() {
  const { data: sp } = await supabase.from('profiles').select('id').eq('email', SALESPERSON_EMAIL).single()
  if (!sp) {
    console.error(`Sales person (${SALESPERSON_EMAIL}) not found.`)
    process.exit(1)
  }
  const spId = sp.id

  for (const table of ['interactions', 'customers']) {
    const { count: before } = await supabase.from(table).select('id', { count: 'exact', head: true }).is('created_by', null)
    const { error } = await supabase.from(table).update({ created_by: spId }).is('created_by', null)
    if (error) {
      console.error(`Failed updating ${table}:`, error.message)
      process.exit(1)
    }
    const { count: after } = await supabase.from(table).select('id', { count: 'exact', head: true }).is('created_by', null)
    console.log(`${table}: reassigned ${before ?? 0} row(s) (remaining null: ${after ?? 0}).`)
  }
  console.log('\nDone.')
}

main().catch((e) => { console.error(e); process.exit(1) })
