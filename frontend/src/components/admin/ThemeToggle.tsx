'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme, type Theme } from './ThemeProvider'

const OPTIONS: { value: Theme; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 p-0.5">
      {OPTIONS.map((o) => {
        const Icon = o.icon
        const active = theme === o.value
        return (
          <button
            key={o.value}
            onClick={() => setTheme(o.value)}
            title={o.label}
            aria-label={o.label}
            aria-pressed={active}
            className={`p-1.5 rounded-md transition-colors ${
              active ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  )
}
