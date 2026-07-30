'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'admin-theme'

function systemPrefersDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && systemPrefersDark())
  document.documentElement.classList.toggle('dark', dark)
}

interface ThemeContextValue {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolved: 'light',
  setTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  const sync = useCallback((t: Theme) => {
    applyTheme(t)
    setResolved(t === 'dark' || (t === 'system' && systemPrefersDark()) ? 'dark' : 'light')
  }, [])

  // On mount, load the stored preference and apply it.
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme) || 'system'
    setThemeState(stored)
    sync(stored)
  }, [sync])

  // Keep in sync with the OS when following the system setting.
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => sync('system')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme, sync])

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t)
      localStorage.setItem(STORAGE_KEY, t)
      sync(t)
    },
    [sync]
  )

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>{children}</ThemeContext.Provider>
  )
}
