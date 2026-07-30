'use client'

import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/flatpickr.min.css'

interface Props {
  value?: string // 'YYYY-MM-DD' (empty = unset)
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

// Lightweight date field backed by flatpickr. Opens on click of the input
// (unlike the native <input type="date">, which only opens on the icon).
// Keeps the same 'YYYY-MM-DD' string contract as the rest of the filters.
export default function DateField({ value, onChange, className = '', placeholder = 'Select date' }: Props) {
  return (
    <Flatpickr
      value={value || ''}
      options={{ dateFormat: 'Y-m-d', altInput: true, altFormat: 'd M Y', allowInput: true }}
      placeholder={placeholder}
      className={className}
      onChange={(_dates, dateStr) => onChange(dateStr)}
    />
  )
}
