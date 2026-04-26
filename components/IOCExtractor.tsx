'use client'
import { useState, useMemo, useCallback } from 'react'
import { X, Scan, Play, Copy, Trash2 } from 'lucide-react'
import { extractIOCs, highlightIOCs, type ExtractedIOC } from '@/utils/iocExtractor'
import type { IndicatorType } from '@/types'
import clsx from 'clsx'

interface Props {
  open: boolean
  onClose: () => void
  onInvestigate: (indicators: string[]) => void
}

const TYPE_STYLE: Record<IndicatorType, { color: string; bg: string }> = {
  ip:     { color: '#3b82f6', bg: '#3b82f620' },
  domain: { color: '#8b5cf6', bg: '#8b5cf620' },
  url:    { color: '#f59e0b', bg: '#f59e0b20' },
  hash:   { color: '#10b981', bg: '#10b98120' },
}

export default function IOCExtractor({ open, onClose, onInvestigate }: Props) {
  const [text, setText] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [extracted, setExtracted] = useState<ExtractedIOC[]>([])
  const [hasExtracted, setHasExtracted] = useState(false)

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    extracted.forEach(i => { c[i.type] = (c[i.type] ?? 0) + 1 })
    return c
  }, [extracted])

  const highlighted = useMemo(() => {
    if (!hasExtracted || !text) return ''
    return highlightIOCs(text, extracted)
  }, [text, extracted, hasExtracted])

  const handleExtract = () => {
    const iocs = extractIOCs(text)
    setExtracted(iocs)
    setSelected(new Set(iocs.map(i => i.value)))
    setHasExtracted(true)
  }

  const toggleSelect = (value: string) => {
    setSelected(s => {
      const next = new Set(s)
      next.has(value) ? next.delete(value) : next.add(value)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === extracted.length) setSelected(new Set())
    else setSelected(new Set(extracted.map(i => i.value)))
  }

  const handleInvestigate = () => {
    const toInvestigate = extracted.filter(i => selected.has(i.value)).map(i => i.value)
    onInvestigate(toInvestigate)
    onClose()
  }

  const handleCopySelected = () => {
    const text = extracted.filter(i => selected.has(i.value)).map(i => i.value).join('\n')
    navigator.clipboard.writeText(text)
  }

  const reset = () => {
    setText('')
    setExtracted([])
    setSelected(new Set())
    setHasExtracted(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl shadow-glow flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Scan size={16} className="text-accent" />
            <span className="font-semibold text-sm text-text">IOC Extractor</span>
            {hasExtracted && extracted.length > 0 && (
              <span className="text-xs text-muted">
                — {extracted.length} found
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {text && <button onClick={reset} className="text-muted hover:text-danger p-1"><Trash2 size={14} /></button>}
            <button onClick={onClose} className="text-muted hover:text-text p-1"><X size={16} /></button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-1 overflow-hidden min-h-0">
          {/* Left: Input */}
          <div className="flex flex-col flex-1 p-4 border-b sm:border-b-0 sm:border-r border-border min-h-0">
            <div className="text-xs text-muted mb-2">
              Paste any text — emails, logs, reports, Pastebin dumps, threat intel feeds
            </div>
            {!hasExtracted ? (
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={`Paste text containing IOCs...\n\nExamples:\n- Server logs with IPs\n- Phishing email headers\n- Malware analysis report\n- Threat intel feed\n- Defanged indicators like 8.8[.]8.8`}
                className="flex-1 bg-bg border border-border rounded-xl p-3 text-xs font-mono text-text placeholder-muted outline-none focus:border-accent resize-none min-h-[160px]"
              />
            ) : (
              <div
                className="flex-1 bg-bg border border-border rounded-xl p-3 text-xs font-mono text-text overflow-y-auto whitespace-pre-wrap break-all min-h-[160px]"
                dangerouslySetInnerHTML={{ __html: highlighted }}
              />
            )}

            {/* Type counts */}
            {hasExtracted && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {Object.entries(counts).map(([type, count]) => {
                  const style = TYPE_STYLE[type as IndicatorType]
                  return (
                    <span
                      key={type}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={{ color: style.color, background: style.bg }}
                    >
                      {count} {type}
                    </span>
                  )
                })}
              </div>
            )}

            <button
              onClick={handleExtract}
              disabled={!text.trim()}
              className="mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accentHover text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
            >
              <Scan size={14} />
              {hasExtracted ? 'Re-extract' : 'Extract IOCs'}
            </button>
          </div>

          {/* Right: Results */}
          {hasExtracted && (
            <div className="flex flex-col w-full sm:w-64 flex-shrink-0 min-h-0">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0">
                <button
                  onClick={toggleAll}
                  className="text-xs text-accent hover:underline"
                >
                  {selected.size === extracted.length ? 'Deselect all' : 'Select all'}
                </button>
                <span className="text-xs text-muted">{selected.size} selected</span>
              </div>

              {extracted.length === 0 ? (
                <div className="flex items-center justify-center flex-1 text-sm text-muted p-4 text-center">
                  No IOCs detected.<br/>
                  <span className="text-xs opacity-60">Try pasting logs or reports</span>
                </div>
              ) : (
                <div className="overflow-y-auto flex-1">
                  {(['ip', 'domain', 'url', 'hash'] as IndicatorType[]).map(type => {
                    const items = extracted.filter(i => i.type === type)
                    if (items.length === 0) return null
                    const style = TYPE_STYLE[type]
                    return (
                      <div key={type}>
                        <div
                          className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest sticky top-0"
                          style={{ color: style.color, background: 'var(--color-surface)' }}
                        >
                          {type} ({items.length})
                        </div>
                        {items.map(ioc => (
                          <button
                            key={ioc.value}
                            onClick={() => toggleSelect(ioc.value)}
                            className={clsx(
                              'flex items-center gap-2 w-full px-3 py-2 text-left transition-colors hover:bg-border',
                              selected.has(ioc.value) ? 'bg-accentGlow' : ''
                            )}
                          >
                            <div
                              className={clsx(
                                'w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center text-white text-[8px] transition-all',
                                selected.has(ioc.value) ? 'border-accent bg-accent' : 'border-border bg-transparent'
                              )}
                            >
                              {selected.has(ioc.value) && '✓'}
                            </div>
                            <span className="text-[11px] font-mono text-text truncate">{ioc.value}</span>
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {hasExtracted && extracted.length > 0 && (
          <div className="flex items-center gap-2 p-4 border-t border-border flex-shrink-0">
            <button
              onClick={handleCopySelected}
              className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-xs text-muted hover:text-text transition-colors"
            >
              <Copy size={13} /> Copy
            </button>
            <button
              onClick={handleInvestigate}
              disabled={selected.size === 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
            >
              <Play size={13} />
              Investigate {selected.size > 0 ? `${selected.size} IOC${selected.size !== 1 ? 's' : ''}` : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}