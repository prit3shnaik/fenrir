'use client'
import { useState } from 'react'
import { X, Download, Copy, FileJson, Shield } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { exportJSON, exportSTIX, downloadFile } from '@/utils/exportUtils'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ExportModal({ open, onClose }: Props) {
  const { nodes, edges } = useStore()
  const [copied, setCopied] = useState<string | null>(null)

  const handleDownload = (type: 'json' | 'stix') => {
    const content = type === 'json' ? exportJSON(nodes, edges) : exportSTIX(nodes, edges)
    const fname = `fenrir-export-${Date.now()}.${type === 'stix' ? 'json' : 'json'}`
    downloadFile(content, fname)
  }

  const handleCopy = async (type: 'json' | 'stix') => {
    const content = type === 'json' ? exportJSON(nodes, edges) : exportSTIX(nodes, edges)
    await navigator.clipboard.writeText(content)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-sm shadow-glow">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Download size={16} className="text-accent" />
            <span className="font-semibold text-sm">Export Investigation</span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text"><X size={16} /></button>
        </div>

        <div className="p-4 flex flex-col gap-3">
          <div className="text-xs text-muted">{nodes.length} nodes · {edges.length} edges</div>

          {[
            { id: 'json' as const, label: 'Fenrir JSON', desc: 'Full graph with metadata', Icon: FileJson },
            { id: 'stix' as const, label: 'STIX 2.1 Bundle', desc: 'Threat intelligence standard', Icon: Shield },
          ].map(({ id, label, desc, Icon }) => (
            <div key={id} className="border border-border rounded-xl p-3 flex items-center gap-3">
              <Icon size={20} className="text-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-muted">{desc}</div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleCopy(id)}
                  className="p-2 rounded-lg border border-border text-muted hover:text-text transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy size={13} />
                </button>
                <button
                  onClick={() => handleDownload(id)}
                  className="p-2 rounded-lg bg-accent text-white hover:bg-accentHover transition-colors"
                  title="Download"
                >
                  <Download size={13} />
                </button>
              </div>
            </div>
          ))}

          {copied && (
            <div className="text-xs text-safe text-center">Copied to clipboard!</div>
          )}
        </div>
      </div>
    </div>
  )
}
