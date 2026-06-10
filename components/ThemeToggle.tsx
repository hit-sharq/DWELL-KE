'use client'

import * as React from 'react'
import { useTheme } from '@/components/theme-provider'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme()
  const current = theme === 'system' ? resolvedTheme : theme

  if (!mounted) return null

  return (
    <button
      type="button"
      onClick={() => setTheme(current === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="p-2 rounded-lg hover:bg-cyan-500/10 transition-colors border border-white/5"
    >
      {current === 'dark' ? (
        <Sun className="h-4 w-4 text-yellow-200" />
      ) : (
        <Moon className="h-4 w-4 text-slate-200" />
      )}
    </button>
  )
}
