'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: Theme
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  resolvedTheme: 'light',
  mounted: false,
})

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'dwell-theme',
}: {
  children: React.ReactNode
  defaultTheme?: Theme | 'system'
  storageKey?: string
}) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  const resolvedTheme = theme

  useEffect(() => {
    setMounted(true)
    const stored = (typeof window !== 'undefined'
      ? localStorage.getItem(storageKey)
      : null) as Theme | null
    if (stored === 'light' || stored === 'dark') {
      setThemeState(stored)
      document.documentElement.classList.add(stored)
      document.documentElement.classList.remove(stored === 'light' ? 'dark' : 'light')
    } else {
      const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const sys = sysDark ? 'dark' : 'light'
      document.documentElement.classList.add(sys)
      setThemeState(sys)
    }
  }, [storageKey])

  const setTheme = (next: Theme) => {
    setThemeState(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, next)
      document.documentElement.classList.add(next)
      document.documentElement.classList.remove(next === 'light' ? 'dark' : 'light')
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
