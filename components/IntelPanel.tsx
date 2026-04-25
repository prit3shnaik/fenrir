'use client'
import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { useStore } from '@/store/useStore'
import NodeDetails from './NodeDetails'
import TimelinePanel from './TimelinePanel'
import GraphSearch from './GraphSearch'
import AISummary from './AISummary'
import clsx from 'clsx'

interface Props {
  onEnrich: (nodeId: string, label: string) => void
  onClose?: () => void
}

type Tab = 'details' | 'nodes' | 'timeline' | 'search' | 'ai'

export default function IntelPanel({ onEnrich, onClose }: Props) {
  const { nodes, selectedNodeId, selectNode } = useStore()
  const [tab, setTab] = useState<Tab>('details')

  const TABS: { id: Tab; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'nodes', label: `Nodes (${nodes.length})` },
    { id: 'search', label: 'Filter' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'ai', label: '✦ AI' },
  ]

  return (
    <div className="flex flex-col h-full border-l border-border bg-surface w-72 flex-shrink-0">
      <div className="flex items-center justify-between px-2 py-2 border-b border-border gap-1 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'px-2 py-1 rounded text-[11px] font-medium transition-colors',
                tab === t.id ? 'bg-accent text-white' : 'text-muted hover:text-text'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {onClose && (
          <button onClick={onClose} className="text-muted hover:text-text ml-auto">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === 'details' ? (
          selectedNodeId ? (
            <NodeDetails onEnrich={onEnrich} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted text-sm gap-2">
              <ChevronRight size={24} className="opacity-30" />
              <span>Select a node to inspect</span>
            </div>
          )
        ) : tab === 'nodes' ? (
          <div className="overflow-y-auto h-full p-2">
            {nodes.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted text-sm">No nodes yet</div>
            ) : (
              <div className="flex flex-col gap-1">
                {nodes.map(n => (
                  <button
                    key={n.id}
                    onClick={() => { selectNode(n.id); setTab('details') }}
                    className={clsx(
                      'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-left transition-colors',
                      selectedNodeId === n.id ? 'bg-accentGlow border border-accent' : 'hover:bg-border'
                    )}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: n.riskScore > 60 ? '#ef4444' : n.riskScore > 30 ? '#f59e0b' : '#10b981' }}
                    />
                    <span className="text-xs font-mono text-text truncate">{n.label}</span>
                    <span className="text-xs text-muted ml-auto flex-shrink-0">{n.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : tab === 'timeline' ? (
          <TimelinePanel />
        ) : tab === 'search' ? (
          <GraphSearch />
        ) : (
          <AISummary />
        )}
      </div>
    </div>
  )
}
