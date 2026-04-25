'use client'
import { useStore } from '@/store/useStore'
import { Moon, Sun } from 'lucide-react'
import { useEffect } from 'react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useStore()

  // Sync class on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="p-1.5 rounded text-muted hover:text-text hover:bg-border transition-all"
    >
      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  )
}
