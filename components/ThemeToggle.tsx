'use client'
import { useStore } from '@/store/useStore'
import { Moon, Sun } from 'lucide-react'
import { useEffect } from 'react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useStore()

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark', 'light')
    root.classList.add(theme)
    // Force React Flow to re-read CSS vars
    root.style.setProperty('--rf-bg-force', theme === 'dark' ? '#0a0a0f' : '#f1f5f9')
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