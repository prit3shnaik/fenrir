'use client'
import { useState, useRef, useEffect } from 'react'
import { Search, X, Zap } from 'lucide-react'
import { detectIndicatorType } from '@/scanners'
import clsx from 'clsx'

interface Props {
  onSearch: (value: string) => void
  loading?: boolean
}

const EXAMPLES = ['8.8.8.8', 'malicious.example.com', 'https://phish.site/login', 'd41d8cd98f00b204e9800998ecf8427e']

const TYPE_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  ip:     { color: '#3b82f6', bg: '#3b82f620', label: 'IP' },
  domain: { color: '#8b5cf6', bg: '#8b5cf620', label: 'Domain' },
  url:    { color: '#f59e0b', bg: '#f59e0b20', label: 'URL' },
  hash:   { color: '#10b981', bg: '#10b98120', label: 'Hash' },
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [phIdx, setPhIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setInterval(() => setPhIdx(i => (i + 1) % EXAMPLES.length), 3000)
    return () => clearInterval(t)
  }, [])

  const detectedType = value.trim() ? detectIndicatorType(value.trim()) : null
  const typeInfo = detectedType ? TYPE_STYLE[detectedType] : null

  const submit = () => { if (value.trim() && !loading) onSearch(value.trim()) }
  const clear = () => { setValue(''); inputRef.current?.focus() }

  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-all duration-200',
        focused ? 'border-accent shadow-glow bg-surface' : 'border-border bg-surface'
      )}
    >
      <Search size={14} className="text-muted flex-shrink-0" />
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={EXAMPLES[phIdx]}
        className="flex-1 bg-transparent text-text placeholder-muted outline-none text-sm font-mono min-w-0"
      />
      {typeInfo && (
        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 hidden sm:block"
          style={{ color: typeInfo.color, background: typeInfo.bg }}>
          {typeInfo.label}
        </span>
      )}
      {value && (
        <button onClick={clear} className="text-muted hover:text-text flex-shrink-0 p-0.5">
          <X size={13} />
        </button>
      )}
      <button
        onClick={submit}
        disabled={!value.trim() || loading}
        className={clsx(
          'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0',
          value.trim() && !loading
            ? 'bg-accent text-white hover:bg-accentHover shadow-glow'
            : 'bg-border text-muted cursor-not-allowed'
        )}
      >
        {loading
          ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          : <><Zap size={11} /><span className="hidden sm:inline">Hunt</span></>
        }
      </button>
    </div>
  )
    }
