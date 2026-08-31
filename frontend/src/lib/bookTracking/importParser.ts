import * as XLSX from 'xlsx'
import type { BookOption, TrackedBook } from '@/app/actions/bookTracking'
import { COURIER_OPTIONS } from './constants'

/** A single row parsed from an uploaded Excel / CSV file. */
export interface ImportRow {
  /** yyyy-MM-dd (empty string if unparseable) */
  date: string
  whatsappId: string
  name: string
  /** Stored format: 10 bare digits for India, or +E.164 for others */
  phone: string
  /** Matched COURIER_OPTIONS value, or '' when unrecognised */
  courier: string
  trackingNo: string
  items: TrackedBook[]
  /** Hard errors – these rows are excluded from import until fixed */
  errors: string[]
  /** Soft warnings – importable, but shown to the user */
  warnings: string[]
  /** Raw text from the BOOKS cell (for display purposes) */
  rawBooks: string
}

type CourierOption = (typeof COURIER_OPTIONS)[number]

// ─── helpers ────────────────────────────────────────────────────────────────

function mapCourier(raw: string): string {
  if (!raw?.trim()) return ''
  const n = raw.trim().toLowerCase()
  const map: Array<{ key: string; value: CourierOption }> = [
    { key: 'india post', value: 'Indian Postal' },
    { key: 'indian postal', value: 'Indian Postal' },
    { key: 'professional', value: 'Professional' },
    { key: 'dtdc', value: 'DTDC' },
    { key: 'st', value: 'ST' },
  ]
  for (const { key, value } of map) {
    if (n === key || n.includes(key)) return value
  }
  return ''
}

function parseDate(raw: unknown): string {
  if (raw == null || raw === '') return ''

  // 1. Excel serial number (e.g. 46265 for 31-Aug-2026)
  if (
    typeof raw === 'number' ||
    (typeof raw === 'string' && !isNaN(Number(raw)) && Number(raw) > 1000 && Number(raw) < 100000)
  ) {
    const num = Number(raw)
    try {
      const parsed = XLSX.SSF.parse_date_code(num)
      if (parsed && parsed.y && parsed.m && parsed.d) {
        const y = parsed.y
        const m = String(parsed.m).padStart(2, '0')
        const d = String(parsed.d).padStart(2, '0')
        return `${y}-${m}-${d}`
      }
    } catch {}
  }

  // 2. JS Date object (e.g. if passed directly)
  if (raw instanceof Date) {
    if (isNaN(raw.getTime())) return ''
    // Adjust by +12h to prevent timezone offset near midnight from shifting calendar date
    const adjusted = new Date(raw.getTime() + 12 * 3600 * 1000)
    const y = adjusted.getUTCFullYear()
    const m = String(adjusted.getUTCMonth() + 1).padStart(2, '0')
    const d = String(adjusted.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const str = String(raw).trim()
  if (!str) return ''

  // 3. YYYY-MM-DD or YYYY/MM/DD
  const ymd = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/)
  if (ymd) {
    const [, yyyy, mm, dd] = ymd
    const month = Number(mm)
    const day = Number(dd)
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${yyyy}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  // 4. DD/MM/YYYY, DD/MM/YY, MM/DD/YYYY, MM/DD/YY (delimiters / or -)
  const dateMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (dateMatch) {
    const [, p1, p2, p3] = dateMatch
    const num1 = Number(p1)
    const num2 = Number(p2)
    const yyyy = p3.length === 2 ? (Number(p3) < 50 ? `20${p3}` : `19${p3}`) : p3

    let day: number
    let month: number

    // If second number > 12, it must be MM/DD/YYYY (e.g. 8/31/2026)
    if (num2 > 12 && num1 <= 12) {
      month = num1
      day = num2
    } else {
      // Default to DD/MM/YYYY
      day = num1
      month = num2
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${yyyy}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }

  // 5. Fallback ISO or standard parseable date string
  const d = new Date(str)
  if (!isNaN(d.getTime())) {
    const adjusted = new Date(d.getTime() + 12 * 3600 * 1000)
    const y = adjusted.getUTCFullYear()
    const m = String(adjusted.getUTCMonth() + 1).padStart(2, '0')
    const day = String(adjusted.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  return ''
}

function stripPhone(raw: string): string {
  const digits = String(raw ?? '').replace(/\s+/g, '').replace(/[^\d]/g, '')
  // For Indian numbers keep only the last 10 digits
  return digits.length > 10 ? digits.slice(-10) : digits
}

function matchBooks(
  rawBooks: string,
  bookOptions: BookOption[],
  qty: number,
): { items: TrackedBook[]; unmatched: string[] } {
  if (!rawBooks?.trim()) return { items: [], unmatched: [] }

  // Split on commas that are not inside parentheses
  const parts = rawBooks
    .split(/,(?![^(]*\))/)
    .map((s) => s.trim())
    .filter(Boolean)

  const items: TrackedBook[] = []
  const unmatched: string[] = []

  for (const part of parts) {
    const n = part.toLowerCase().replace(/\s+/g, ' ')
    const match = bookOptions.find((b) => {
      const bt = b.title.toLowerCase().replace(/\s+/g, ' ')
      return bt === n || bt.includes(n) || n.includes(bt)
    })
    if (match) {
      if (!items.some((i) => i.id === match.id)) {
        items.push({ id: match.id, title: match.title, qty })
      }
    } else {
      unmatched.push(part)
    }
  }

  return { items, unmatched }
}

// ─── main export ─────────────────────────────────────────────────────────────

/**
 * Parses an uploaded Excel / CSV file buffer into an array of ImportRow
 * objects ready to be previewed and bulk-imported.
 *
 * Call this from a 'use client' component after reading the file as
 * ArrayBuffer. The xlsx module is bundled together with this file so the
 * dynamic import is done at the call-site:
 *   const { parseImportFile } = await import('@/lib/bookTracking/importParser')
 */
export function parseImportFile(buffer: ArrayBuffer, bookOptions: BookOption[]): ImportRow[] {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: false })
  const ws = wb.Sheets[wb.SheetNames[0]]

  const allRows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: '',
    raw: true,
  }) as unknown[][]

  // Locate the header row (first row containing DATE or WHATSAPP ID)
  let headerIdx = -1
  for (let i = 0; i < allRows.length; i++) {
    const cells = allRows[i].map((c) => String(c ?? '').trim().toUpperCase())
    if (cells.includes('DATE') || cells.includes('WHATSAPP ID')) {
      headerIdx = i
      break
    }
  }
  if (headerIdx === -1) return []

  const headers = allRows[headerIdx].map((c) => String(c ?? '').trim().toUpperCase())
  const col = (name: string) => headers.indexOf(name)

  const dateIdx = col('DATE')
  const waIdx = col('WHATSAPP ID')
  const nameIdx = col('NAME')
  const phoneIdx = col('PHONE')
  const trackingIdx = col('TRACKING NO')
  const courierIdx = col('COURIER')
  const booksIdx = col('BOOKS')
  // Accept common header variants for quantity
  const quantityIdx = [
    col('QUANTITY'),
    col('QTY'),
    col('NO OF BOOKS'),
    col('QUANTITY (NOS)'),
    col('NOS'),
  ].find((i) => i !== -1) ?? -1

  const results: ImportRow[] = []

  for (let i = headerIdx + 1; i < allRows.length; i++) {
    const row = allRows[i]
    // Skip fully empty rows
    if (row.every((c) => !String(c ?? '').trim())) continue

    const rawDate = row[dateIdx]
    const rawWa = String(row[waIdx] ?? '').trim()
    const rawName = String(row[nameIdx] ?? '').trim()
    const rawPhone = String(row[phoneIdx] ?? '').trim()
    const rawTracking = String(row[trackingIdx] ?? '').trim()
    const rawCourier = String(row[courierIdx] ?? '').trim()
    const rawBooks = String(row[booksIdx] ?? '').trim()

    // Parse quantity – fall back to 1 when column is absent or value is non-numeric
    const rawQty = quantityIdx !== -1 ? String(row[quantityIdx] ?? '').trim() : ''
    const qty = rawQty ? Math.max(1, Math.floor(Number(rawQty)) || 1) : 1

    const date = parseDate(rawDate)
    const phone = stripPhone(rawPhone)
    const courier = mapCourier(rawCourier)
    const { items, unmatched } = matchBooks(rawBooks, bookOptions, qty)

    const errors: string[] = []
    const warnings: string[] = []

    if (!date) errors.push('Invalid or missing date')
    if (!rawWa) errors.push('WhatsApp ID is missing')
    if (!rawName) errors.push('Name is missing')
    if (!phone || phone.length < 6) errors.push('Invalid phone number')
    if (!rawTracking) errors.push('Tracking number is missing')
    if (!items.length) {
      errors.push(rawBooks ? `No books matched: "${rawBooks}"` : 'Books are missing')
    }

    if (unmatched.length) {
      warnings.push(`Unmatched: ${unmatched.join(', ')}`)
    }

    results.push({
      date,
      whatsappId: rawWa,
      name: rawName,
      phone,
      courier,
      trackingNo: rawTracking,
      items,
      errors,
      warnings,
      rawBooks,
    })
  }

  return results
}
