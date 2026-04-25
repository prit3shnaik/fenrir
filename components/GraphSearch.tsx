'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { Search } from 'lucide-react'
import { riskColor } from '@/utils/riskScoring'
import type { RiskLevel } from '@/types'

export default function GraphSearch() {
  const { nodes, selectNode } = useStore()
  const [query, setQuery] = useState('')
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all')

  const filtered = useMemo(() => {
    return nodes.filter(n => {
      const matchesQuery = !query || n.label.toLowerCase().includes(query.toLowerCase())
      const matchesRisk = filterRisk === 'all' || n.riskLevel === filterRisk
      return matchesQuery && matchesRisk
    })
  }, [nodes, query, filterRisk])

  const RISK_LEVELS: (RiskLevel | 'all')[] = ['all', 'critical', 'high', 'medium', 'low', 'unknown']

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-center gap-2 bg-bg border border-border rounded-lg px-2 py-1.5">
        <Search size={12} className="text-muted" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filter nodes..."
          className="flex-1 bg-transparent text-xs text-text outline-none placeholder-muted"
        />
      </div>

      <div className="flex gap-1 flex-wrap">
        {RISK_LEVELS.map(r => (
          <button
            key={r}
            onClick={() => setFilterRisk(r)}
            className="px-2 py-0.5 rounded text-[10px] border transition-all capitalize"
            style={{
              borderColor: filterRisk === r ? (r === 'all' ? '#7c3aed' : riskColor(r as RiskLevel)) : '#1e1e2e',
              color: filterRisk === r ? (r === 'all' ? '#7c3aed' : riskColor(r as RiskLevel)) : '#6b7280',
              background: filterRisk === r ? '#1e1e2e' : 'transparent',
            }}
          >
            {r} {r !== 'all' && `(${nodes.filter(n => n.riskLevel === r).length})`}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
        {filtered.map(n => (
          <button
            key={n.id}
            onClick={() => selectNode(n.id)}
            className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-border text-left transition-colors"
          >
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: riskColor(n.riskLevel) }} />
            <span className="text-xs font-mono text-text truncate">{n.label}</span>
            <span className="text-[10px] text-muted ml-auto">{n.riskScore}/100</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="text-xs text-muted text-center py-2">No matches</div>
        )}
      </div>
    </div>
  )
}
