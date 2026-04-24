'use client'
import { useStore } from '@/store/useStore'
import { riskColor, riskBg } from '@/utils/riskScoring'
import { Shield, Tag, FileText, RefreshCw } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  onEnrich: (nodeId: string, label: string) => void
}

export default function NodeDetails({ onEnrich }: Props) {
  const { nodes, selectedNodeId, enrichmentResults, setNodeNotes } = useStore()
  const node = nodes.find(n => n.id === selectedNodeId)
  if (!node) return null

  const results = enrichmentResults[node.id] ?? []

  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-muted uppercase tracking-wide mb-1">{node.type} · {node.indicatorType ?? 'unknown'}</div>
          <div className="font-mono text-sm text-text break-all">{node.label}</div>
        </div>
        <button
          onClick={() => onEnrich(node.id, node.label)}
          disabled={node.loading}
          className="flex-shrink-0 p-2 rounded-lg border border-border hover:border-accent hover:text-accent transition-all text-muted"
        >
          <RefreshCw size={14} className={clsx(node.loading && 'animate-spin')} />
        </button>
      </div>

      {/* Risk Score */}
      <div
        className="rounded-lg p-3 flex items-center gap-3"
        style={{ background: riskBg(node.riskLevel), border: `1px solid ${riskColor(node.riskLevel)}` }}
      >
        <Shield size={20} style={{ color: riskColor(node.riskLevel) }} />
        <div>
          <div className="text-xs text-muted">Risk Score</div>
          <div className="font-mono font-semibold" style={{ color: riskColor(node.riskLevel) }}>
            {node.riskScore}/100 — {node.riskLevel.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Provider Results */}
      {results.length > 0 && (
        <div>
          <div className="text-xs text-muted uppercase tracking-wide mb-2 flex items-center gap-1">
            <Tag size={10} /> Intel Sources
          </div>
          <div className="flex flex-col gap-2">
            {results.map(r => (
              <div key={r.provider} className="rounded-lg border border-border p-3 bg-surface">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-textDim">{r.provider}</span>
                  {r.error ? (
                    <span className="text-xs text-danger">Error</span>
                  ) : (
                    <span className="text-xs font-mono" style={{ color: riskColor(r.riskScore >= 60 ? 'high' : r.riskScore >= 30 ? 'medium' : 'low') }}>
                      {r.riskScore}/100
                    </span>
                  )}
                </div>
                {r.error && <div className="text-xs text-muted">{r.error}</div>}
                {r.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {r.tags.slice(0, 5).map(t => (
                      <span key={t} className="text-xs bg-border text-textDim rounded px-1.5 py-0.5">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <div className="text-xs text-muted uppercase tracking-wide mb-2 flex items-center gap-1">
          <FileText size={10} /> Notes
        </div>
        <textarea
          value={node.notes}
          onChange={e => setNodeNotes(node.id, e.target.value)}
          placeholder="Add investigation notes..."
          rows={4}
          className="w-full bg-surface border border-border rounded-lg p-2 text-sm text-text placeholder-muted outline-none focus:border-accent resize-none font-mono"
        />
      </div>
    </div>
  )
}
