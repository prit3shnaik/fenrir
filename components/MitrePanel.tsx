'use client'
import { useMemo } from 'react'
import { useStore } from '@/store/useStore'
import { getAttackTechniques, tacticColor, tacticBg } from '@/utils/mitreMapping'
import { ExternalLink, Shield } from 'lucide-react'

export default function MitrePanel() {
  const { nodes, enrichmentResults } = useStore()

  const techniques = useMemo(() => {
    const allTags: string[] = []
    nodes.forEach(n => {
      const results = enrichmentResults[n.id] ?? []
      results.forEach(r => allTags.push(...r.tags))
    })
    return getAttackTechniques(allTags)
  }, [nodes, enrichmentResults])

  const byTactic = useMemo(() => {
    const map: Record<string, typeof techniques> = {}
    techniques.forEach(t => {
      if (!map[t.tactic]) map[t.tactic] = []
      map[t.tactic].push(t)
    })
    return map
  }, [techniques])

  if (techniques.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
        <Shield size={32} className="text-muted opacity-30" />
        <div className="text-sm text-muted">No ATT&CK techniques mapped yet</div>
        <div className="text-xs text-muted/60">Enrich nodes to auto-detect techniques from tags</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-3 overflow-y-auto h-full">
      {/* Summary badges */}
      <div className="flex items-center justify-between">
        <div className="text-[10px] text-muted uppercase tracking-wide">
          {techniques.length} technique{techniques.length !== 1 ? 's' : ''} · {Object.keys(byTactic).length} tactic{Object.keys(byTactic).length !== 1 ? 's' : ''}
        </div>
        <a
          href="https://attack.mitre.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-accent flex items-center gap-0.5 hover:underline"
        >
          ATT&CK <ExternalLink size={8} />
        </a>
      </div>

      {/* Tactic groups */}
      {Object.entries(byTactic).map(([tactic, techs]) => (
        <div key={tactic} className="rounded-xl overflow-hidden border border-border">
          {/* Tactic header */}
          <div
            className="px-3 py-2 flex items-center gap-2"
            style={{ background: tacticBg(tactic), borderBottom: `1px solid ${tacticColor(tactic)}33` }}
          >
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tacticColor(tactic) }} />
            <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: tacticColor(tactic) }}>
              {tactic.replace(/-/g, ' ')}
            </span>
          </div>

          {/* Techniques */}
          <div className="flex flex-col divide-y divide-border">
            {techs.map(t => (
              <a
                key={t.id}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-border transition-colors group"
              >
                <span
                  className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{ color: tacticColor(tactic), background: tacticBg(tactic) }}
                >
                  {t.id}
                </span>
                <span className="text-xs text-text flex-1 min-w-0 truncate">{t.name}</span>
                <ExternalLink size={10} className="text-muted opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      ))}

      {/* Navigator link */}
      <a
        href={`https://mitre-attack.github.io/attack-navigator/`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] text-center text-accent hover:underline py-1"
      >
        Open ATT&CK Navigator ↗
      </a>
    </div>
  )
}