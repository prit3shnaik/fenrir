'use client'
import { useState } from 'react'
import { X, Upload, Play } from 'lucide-react'
import { detectIndicatorType } from '@/scanners'

interface Props {
  open: boolean
  onClose: () => void
  onInvestigate: (indicators: string[]) => void
}

export default function BulkImportModal({ open, onClose, onInvestigate }: Props) {
  const [text, setText] = useState('')

  const parsed = text
    .split(/[\n,\s]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 20) // cap at 20 to avoid API hammering

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-glow">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Upload size={16} className="text-accent" />
            <span className="font-semibold text-sm">Bulk Import IOCs</span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text"><X size={16} /></button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <p className="text-xs text-muted">Paste IPs, domains, URLs or hashes. One per line or comma separated. Max 20.</p>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`8.8.8.8\nmalicious.example.com\nd41d8cd98f00b204e9800998ecf8427e`}
            rows={8}
            className="w-full bg-bg border border-border rounded-lg p-3 text-xs font-mono text-text placeholder-muted outline-none focus:border-accent resize-none"
          />

          {parsed.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="text-xs text-muted">{parsed.length} indicators detected:</div>
              <div className="flex flex-wrap gap-1">
                {parsed.map(p => (
                  <span key={p} className="text-[10px] font-mono bg-border text-textDim rounded px-1.5 py-0.5">
                    {detectIndicatorType(p)}: {p.length > 20 ? p.slice(0, 20) + '…' : p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-text">Cancel</button>
          <button
            onClick={() => { onInvestigate(parsed); onClose() }}
            disabled={parsed.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play size={13} />
            Investigate {parsed.length > 0 ? `(${parsed.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
