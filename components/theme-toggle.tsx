'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-card-border bg-background-secondary text-text-muted transition-all hover:bg-card-hover hover:text-text-primary active:scale-95"
      aria-label="Toggle theme"
    >
      {/* User requested icon to match CURRENT theme */}
      {theme === 'dark' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </button>
  )
}
