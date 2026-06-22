'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: Exclude<Theme, 'system'>
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
  mounted: false,
})

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'dwell-theme',
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  const resolvedTheme = useMemo<Exclude<Theme, 'system'>>(() => {
    if (theme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    }
    return theme
  }, [theme])

  const applyTheme = (resolved: Exclude<Theme, 'system'>) => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
  }

  useEffect(() => {
    setMounted(true)
    const stored = (typeof window !== 'undefined'
      ? localStorage.getItem(storageKey)
      : null) as Theme | null
    const initialTheme = (stored === 'light' || stored === 'dark' || stored === 'system')
      ? stored
      : defaultTheme
    setThemeState(initialTheme)

    const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolved = initialTheme === 'system' ? (sysDark ? 'dark' : 'light') : initialTheme
    applyTheme(resolved)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (initialTheme === 'system') {
        applyTheme(mediaQuery.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [storageKey, defaultTheme])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, next)
      const resolved = next === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : next
      applyTheme(resolved)
    }
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
