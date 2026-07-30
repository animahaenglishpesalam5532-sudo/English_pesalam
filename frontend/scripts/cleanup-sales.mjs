/**
 * Removes the test data created by seed-sales.mjs (using scripts/.seed-manifest.json).
 * Run from the `frontend/` folder:  node scripts/cleanup-sales.mjs
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

async function main() {
  let manifest
  try {
    manifest = JSON.parse(fs.readFileSync('scripts/.seed-manifest.json', 'utf8'))
  } catch {
    console.error('No scripts/.seed-manifest.json found — nothing to clean up.')
    process.exit(1)
  }

  const { customerIds = [], staffEmails = [] } = manifest

  // Deleting customers cascades to their interactions (and interaction_edits)
  for (let i = 0; i < customerIds.length; i += 200) {
    const batch = customerIds.slice(i, i + 200)
    const { error } = await supabase.from('customers').delete().in('id', batch)
    if (error) console.warn('customer delete:', error.message)
  }
  console.log(`  removed ${customerIds.length} test customers (+ their interactions)`)

  // Remove test staff auth users (cascades their profile row)
  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  for (const email of staffEmails) {
    const u = list?.users?.find((x) => x.email === email)
    if (u) {
      await supabase.auth.admin.deleteUser(u.id)
      console.log('  removed staff', email)
    }
  }

  fs.unlinkSync('scripts/.seed-manifest.json')
  console.log('\nCleanup complete.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
