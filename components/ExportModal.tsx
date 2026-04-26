'use client'
import { useState } from 'react'
import { X, Download, Copy, FileJson, Shield, FileText, Image, File } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { exportJSON, exportSTIX, downloadFile } from '@/utils/exportUtils'
import { defangAll } from '@/utils/defang'
import { exportGraphAsPNG } from '@/utils/graphExport'
import { exportMarkdown, exportPDF } from '@/utils/pdfExport'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ExportModal({ open, onClose }: Props) {
  const { nodes, edges, enrichmentResults } = useStore()
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleExport = async (id: string) => {
    setLoading(id)
    try {
      switch (id) {
        case 'json':
          downloadFile(exportJSON(nodes, edges), `fenrir-${Date.now()}.json`)
          break
        case 'stix':
          downloadFile(exportSTIX(nodes, edges), `fenrir-stix-${Date.now()}.json`)
          break
        case 'defanged':
          downloadFile(nodes.map(n => defangAll(n.label)).join('\n'), `fenrir-iocs-${Date.now()}.txt`, 'text/plain')
          break
        case 'markdown': {
          const md = await exportMarkdown(nodes, edges, enrichmentResults as Record<string, unknown[]>)
          downloadFile(md, `fenrir-report-${Date.now()}.md`, 'text/markdown')
          break
        }
        case 'pdf':
          await exportPDF(nodes, edges, enrichmentResults as Record<string, unknown[]>)
          break
        case 'png':
          await exportGraphAsPNG()
          break
      }
    } finally {
      setLoading(null)
    }
  }

  if (!open) return null

  const EXPORTS = [
    { id: 'json',     label: 'Fenrir JSON',    desc: 'Full graph with metadata',          Icon: FileJson, canCopy: true  },
    { id: 'stix',     label: 'STIX 2.1',       desc: 'Threat intel standard bundle',       Icon: Shield,   canCopy: true  },
    { id: 'defanged', label: 'Defanged IOCs',  desc: 'Safe to paste in reports',           Icon: FileText, canCopy: true  },
    { id: 'markdown', label: 'Markdown Report',desc: 'Structured .md investigation report',Icon: FileText, canCopy: false },
    { id: 'pdf',      label: 'PDF Report',     desc: 'Opens print dialog → Save as PDF',   Icon: File,     canCopy: false },
    { id: 'png',      label: 'Graph PNG',      desc: 'Screenshot of current graph view',   Icon: Image,    canCopy: false },
  ]

  const getContent = (id: string) => {
    switch (id) {
      case 'json': return exportJSON(nodes, edges)
      case 'stix': return exportSTIX(nodes, edges)
      case 'defanged': return nodes.map(n => defangAll(n.label)).join('\n')
      default: return ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-glow">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Download size={16} className="text-accent" />
            <span className="font-semibold text-sm text-text">Export Investigation</span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1"><X size={16} /></button>
        </div>

        <div className="p-4 flex flex-col gap-2">
          <div className="text-xs text-muted mb-1">{nodes.length} nodes · {edges.length} edges</div>

          {EXPORTS.map(({ id, label, desc, Icon, canCopy }) => (
            <div key={id} className="flex items-center gap-3 border border-border rounded-xl p-3 hover:border-border/80 transition-colors">
              <Icon size={18} className="text-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text">{label}</div>
                <div className="text-[10px] text-muted">{desc}</div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {canCopy && (
                  <button
                    onClick={() => handleCopy(id, getContent(id))}
                    className="p-1.5 rounded-lg border border-border text-muted hover:text-text transition-colors"
                    title="Copy"
                  >
                    <Copy size={12} />
                  </button>
                )}
                <button
                  onClick={() => handleExport(id)}
                  disabled={loading === id}
                  className="p-1.5 rounded-lg bg-accent text-white hover:bg-accentHover transition-colors disabled:opacity-60"
                  title="Download"
                >
                  {loading === id
                    ? <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin block" />
                    : <Download size={12} />
                  }
                </button>
              </div>
            </div>
          ))}

          {copied && (
            <div className="text-xs text-safe text-center py-1">✓ Copied to clipboard</div>
          )}
        </div>
      </div>
    </div>
  )
}