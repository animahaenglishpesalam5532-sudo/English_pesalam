/**
 * Reports storage used by the sales tables.
 * Run from the `frontend/` folder:  node scripts/db-size.mjs
 *
 * Uses the exact Postgres figures via the admin_table_sizes() RPC when it's
 * installed (see scripts/db-size.sql). Otherwise falls back to a data-driven
 * estimate computed from the real rows.
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

const mb = (b) => (b / 1024 / 1024).toFixed(3) + ' MB'
const kb = (b) => (b / 1024).toFixed(1) + ' KB'

async function count(table) {
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
  return count ?? 0
}

async function exact() {
  const { data, error } = await supabase.rpc('admin_table_sizes')
  if (error || !data) return null
  return data
}

async function estimate() {
  const [nInter, nCust, nEdits] = await Promise.all([
    count('interactions'),
    count('customers'),
    count('interaction_edits'),
  ])

  // Measure the variable columns from the actual data.
  let itemsBytes = 0
  let notesBytes = 0
  const PAGE = 1000
  for (let from = 0; from < nInter; from += PAGE) {
    const { data } = await supabase
      .from('interactions')
      .select('items, notes')
      .range(from, from + PAGE - 1)
    for (const r of data ?? []) {
      itemsBytes += Buffer.byteLength(JSON.stringify(r.items ?? []), 'utf8')
      notesBytes += r.notes ? Buffer.byteLength(r.notes, 'utf8') : 0
    }
  }

  // Rough per-row constants (fixed columns + tuple header/alignment).
  const INTER_FIXED = 110 + 28 // typed columns + row overhead
  const CUST_FIXED = 90 + 28
  const EDIT_FIXED = 70 + 28
  const IDX_PER_ROW = (n, indexes) => n * indexes * 32 // ~32 B per b-tree entry incl. page overhead

  const interHeap = nInter * INTER_FIXED + itemsBytes + notesBytes
  const interIdx = IDX_PER_ROW(nInter, 6) // pk + 5 secondary indexes
  const custHeap = nCust * (CUST_FIXED + 20) // + avg name/phone
  const custIdx = IDX_PER_ROW(nCust, 2) // pk + unique(phone)
  const editHeap = nEdits * (EDIT_FIXED + 30)
  const editIdx = IDX_PER_ROW(nEdits, 2)

  const total = interHeap + interIdx + custHeap + custIdx + editHeap + editIdx

  console.log('\n=== Estimated storage (data-driven) ===')
  console.log(`interactions      : ${nInter} rows`)
  console.log(`  heap            : ${kb(interHeap)}  (items ${kb(itemsBytes)}, notes ${kb(notesBytes)})`)
  console.log(`  indexes (x6)    : ${kb(interIdx)}`)
  console.log(`customers         : ${nCust} rows  -> ${kb(custHeap + custIdx)}`)
  console.log(`interaction_edits : ${nEdits} rows  -> ${kb(editHeap + editIdx)}`)
  console.log(`------------------------------------------`)
  console.log(`TOTAL             : ${mb(total)}`)
  if (nInter > 0) {
    console.log(`Per 1,000 records : ${mb((total / nInter) * 1000)}`)
  }
  console.log('\n(Install scripts/db-size.sql in the Supabase SQL editor for exact figures.)')
}

async function main() {
  const rows = await exact()
  if (rows) {
    console.log('\n=== Exact storage (pg_total_relation_size) ===')
    let total = 0
    let interRows = 0
    for (const r of rows) {
      total += Number(r.total_bytes)
      if (r.table_name === 'interactions') interRows = Number(r.row_estimate)
      console.log(
        `${r.table_name.padEnd(18)}: total ${mb(Number(r.total_bytes))}  ` +
          `(table ${kb(Number(r.table_bytes))}, indexes ${kb(Number(r.index_bytes))}, ~${r.row_estimate} rows)`
      )
    }
    console.log(`------------------------------------------`)
    console.log(`TOTAL             : ${mb(total)}`)
    if (interRows > 0) console.log(`Per 1,000 interactions: ${mb((total / interRows) * 1000)}`)
    return
  }
  await estimate()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
