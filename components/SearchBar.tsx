'use client'
import { useState, useRef, useEffect } from 'react'
import { Search, X, Zap } from 'lucide-react'
import { detectIndicatorType } from '@/scanners'
import clsx from 'clsx'

interface Props {
  onSearch: (value: string) => void
  loading?: boolean
}

const PLACEHOLDERS = [
  'Enter IP, domain, URL or hash...',
  '8.8.8.8',
  'malicious.example.com',
  'https://phish.example.com/login',
  'd41d8cd98f00b204e9800998ecf8427e',
]

export default function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [phIdx, setPhIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 3000)
    return () => clearInterval(t)
  }, [])

  const detectedType = value.trim() ? detectIndicatorType(value.trim()) : null

  const submit = () => {
    if (value.trim() && !loading) onSearch(value.trim())
  }

  const clear = () => { setValue(''); inputRef.current?.focus() }

  const typeColor: Record<string, string> = {
    ip: 'text-blue-400', domain: 'text-purple-400',
    url: 'text-yellow-400', hash: 'text-green-400',
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={clsx(
          'flex items-center gap-2 rounded-xl border px-4 py-3 transition-all duration-200',
          focused
            ? 'border-accent bg-surface shadow-glow'
            : 'border-border bg-surface'
        )}
      >
        <Search size={16} className="text-muted flex-shrink-0" />
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={PLACEHOLDERS[phIdx]}
          className="flex-1 bg-transparent text-text placeholder-muted outline-none text-sm font-mono"
        />
        {detectedType && (
          <span className={clsx('text-xs font-mono uppercase flex-shrink-0', typeColor[detectedType])}>
            {detectedType}
          </span>
        )}
        {value && (
          <button onClick={clear} className="text-muted hover:text-text transition-colors">
            <X size={14} />
          </button>
        )}
        <button
          onClick={submit}
          disabled={!value.trim() || loading}
          className={clsx(
            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
            value.trim() && !loading
              ? 'bg-accent text-white hover:bg-accentHover'
              : 'bg-border text-muted cursor-not-allowed'
          )}
        >
          {loading ? (
            <span className="animate-spin">◌</span>
          ) : (
            <><Zap size={12} /><span>Hunt</span></>
          )}
        </button>
      </div>
    </div>
  )
}
