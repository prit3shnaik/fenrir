'use client'
import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { riskColor, riskBg } from '@/utils/riskScoring'
import { Clock } from 'lucide-react'

export default function TimelinePanel() {
  const { nodes, enrichmentResults } = useStore()

  const events = useMemo(() => {
    const all: { time: number; label: string; provider: string; nodeLabel: string; riskScore: number }[] = []

    nodes.forEach(node => {
      const results = enrichmentResults[node.id] ?? []
      results.forEach(r => {
        if (!r.error) {
          all.push({
            time: r.timestamp,
            label: `${r.provider} enriched`,
            provider: r.provider,
            nodeLabel: node.label,
            riskScore: r.riskScore,
          })
        }
      })
      all.push({
        time: node.createdAt,
        label: 'Node created',
        provider: 'System',
        nodeLabel: node.label,
        riskScore: node.riskScore,
      })
    })

    return all.sort((a, b) => b.time - a.time)
  }, [nodes, enrichmentResults])

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-sm">
        No timeline events yet
      </div>
    )
  }

  return (
    <div className="overflow-y-auto h-full p-3">
      <div className="flex items-center gap-2 mb-3 text-xs text-muted uppercase tracking-wide">
        <Clock size={10} /> Timeline
      </div>
      <div className="relative">
        <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
        <div className="flex flex-col gap-3 pl-6">
          {events.map((e, i) => (
            <div key={i} className="relative">
              <div
                className="absolute -left-4 top-1.5 w-2 h-2 rounded-full border border-bg"
                style={{ background: e.riskScore > 60 ? '#ef4444' : e.riskScore > 30 ? '#f59e0b' : '#10b981' }}
              />
              <div className="text-[10px] text-muted mb-0.5">
                {new Date(e.time).toLocaleTimeString()}
              </div>
              <div className="text-xs text-text font-mono truncate">{e.nodeLabel}</div>
              <div className="text-[10px] text-textDim">{e.label} · {e.provider}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
