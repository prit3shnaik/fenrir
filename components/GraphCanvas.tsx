'use client'
import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Handle,
  Position,
  type NodeChange,
  type NodeProps,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useStore } from '@/store/useStore'
import { toReactFlowNodes, toReactFlowEdges } from '@/utils/graphUtils'
import { riskColor, riskBg, riskLevelFromScore } from '@/utils/riskScoring'
import type { FenrirNode } from '@/types'
import clsx from 'clsx'

const TYPE_ICONS: Record<string, string> = {
  Indicator:      '◎',
  Infrastructure: '⬡',
  Threat:         '⚠',
  IntelSource:    '◈',
  Verdict:        '✓',
}

const INDICATOR_COLORS: Record<string, string> = {
  ip:     '#3b82f6',
  domain: '#8b5cf6',
  url:    '#f59e0b',
  hash:   '#10b981',
}

function RiskRing({ score }: { score: number }) {
  const r = 18
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = riskColor(riskLevelFromScore(score))
  return (
    <svg width="44" height="44" className="flex-shrink-0">
      <circle cx="22" cy="22" r={r} fill="none" stroke={color + '22'} strokeWidth="3" />
      <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 22 22)" />
      <text x="22" y="26" textAnchor="middle" fontSize="9" fontFamily="monospace"
        fill={color} fontWeight="600">{score}</text>
    </svg>
  )
}

function FenrirNodeComponent({ data, selected }: NodeProps) {
  const node = data as unknown as FenrirNode & { _tags?: string[] }
  const indicatorColor = node.indicatorType ? INDICATOR_COLORS[node.indicatorType] : '#7c3aed'
  const rc = riskColor(node.riskLevel)

  return (
    <div
      className={clsx(
        'relative rounded-2xl transition-all duration-200 select-none overflow-hidden',
        'min-w-[155px] max-w-[210px]',
        node.loading && 'node-loading',
        selected && 'ring-2 ring-white/30'
      )}
      style={{
        background: `linear-gradient(135deg, ${riskBg(node.riskLevel)}, ${riskBg(node.riskLevel)}88)`,
        border: `1.5px solid ${rc}55`,
        boxShadow: selected
          ? `0 0 0 2px ${rc}44, 0 4px 20px ${rc}22`
          : `0 2px 8px ${rc}11`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <Handle type="target" position={Position.Top}
        style={{ background: rc, border: '2px solid var(--color-bg)', width: 8, height: 8, top: -4 }} />

      <div className="h-0.5 w-full"
        style={{ background: `linear-gradient(90deg, ${indicatorColor}, ${rc})` }} />

      <div className="p-2.5">
        <div className="flex items-center justify-between mb-1.5 gap-1">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-sm flex-shrink-0" style={{ color: indicatorColor }}>
              {TYPE_ICONS[node.type] ?? '◎'}
            </span>
            <span className="text-[9px] uppercase tracking-widest font-medium truncate"
              style={{ color: rc + 'cc' }}>
              {node.indicatorType ?? node.type}
            </span>
          </div>
          {node.enriched && (
            <span className="text-[8px] text-safe bg-safe/10 px-1 py-0.5 rounded-full flex-shrink-0">✓</span>
          )}
        </div>

        <div className="font-mono text-[11px] leading-tight break-all mb-2"
          style={{ color: 'var(--color-text)' }}>
          {node.label.length > 28 ? node.label.slice(0, 26) + '…' : node.label}
        </div>

        {node.enriched && node.riskScore > 0 ? (
          <div className="flex items-center gap-1.5">
            <RiskRing score={node.riskScore} />
            <div>
              <div className="text-[9px] uppercase font-semibold" style={{ color: rc }}>
                {node.riskLevel}
              </div>
              <div className="text-[8px] text-muted">risk</div>
            </div>
          </div>
        ) : node.loading ? (
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span className="text-[9px] text-muted animate-pulse">scanning…</span>
          </div>
        ) : (
          <div className="text-[9px] text-muted/60">right-click to enrich</div>
        )}

        {node.enriched && node._tags && node._tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {node._tags.slice(0, 2).map((t: string) => (
              <span key={t} className="text-[8px] px-1 py-0.5 rounded bg-border/50 text-muted truncate max-w-[80px]">{t}</span>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom}
        style={{ background: rc, border: '2px solid var(--color-bg)', width: 8, height: 8, bottom: -4 }} />
    </div>
  )
}

const nodeTypes = { fenrirNode: FenrirNodeComponent }

export default function GraphCanvas() {
  const { nodes, edges, selectedNodeId, selectNode, updateNodePosition, enrichmentResults } = useStore()

  const rfNodes = useMemo(() =>
    toReactFlowNodes(nodes).map(n => {
      const tags = (enrichmentResults[n.id] ?? []).flatMap((r: { tags: string[] }) => r.tags).slice(0, 3)
      return { ...n, selected: n.id === selectedNodeId, data: { ...n.data, _tags: tags } }
    }),
    [nodes, selectedNodeId, enrichmentResults]
  )

  const rfEdges = useMemo(() => toReactFlowEdges(edges), [edges])

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach(c => {
      if (c.type === 'position' && 'position' in c && c.position) {
        updateNodePosition(c.id, c.position as { x: number; y: number })
      }
    })
  }, [updateNodePosition])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    selectNode(node.id)
  }, [selectNode])

  const onNodeContextMenu = useCallback((e: React.MouseEvent, node: Node) => {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('fenrir:contextmenu', {
      detail: { nodeId: node.id, x: e.clientX, y: e.clientY }
    }))
    selectNode(node.id)
  }, [selectNode])

  const onPaneClick = useCallback(() => selectNode(null), [selectNode])
  const onPaneContextMenu = useCallback((e: React.MouseEvent) => { e.preventDefault() }, [])

  if (nodes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg gap-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% 50%, var(--color-accent-glow) 0%, transparent 65%)' }} />

        <div className="relative flex flex-col items-center gap-4 px-6 text-center">
          <svg width="72" height="72" viewBox="0 0 80 80" className="opacity-25">
            <polygon points="40,5 70,22.5 70,57.5 40,75 10,57.5 10,22.5"
              fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
            <polygon points="40,15 62,27.5 62,52.5 40,65 18,52.5 18,27.5"
              fill="none" stroke="var(--color-accent)" strokeWidth="0.75" opacity="0.5" />
            {[{cx:40,cy:5},{cx:70,cy:22.5},{cx:70,cy:57.5},{cx:40,cy:75},{cx:10,cy:57.5},{cx:10,cy:22.5}].map((p,i) => (
              <circle key={i} cx={p.cx} cy={p.cy} r="2.5" fill="var(--color-accent)" />
            ))}
            <text x="40" y="44" textAnchor="middle" fontSize="18" fontWeight="700"
              fill="var(--color-accent)" fontFamily="monospace">F</text>
          </svg>

          <div>
            <h1 className="text-xl font-bold text-text tracking-tight">Fenrir</h1>
            <p className="text-sm text-muted mt-1">Graph-native threat intelligence</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {['IP Address', 'Domain', 'URL', 'File Hash'].map(t => (
              <span key={t} className="text-[11px] px-2.5 py-1 rounded-full border border-border text-muted">
                {t}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted/40 font-mono">
            <span>Search</span><span className="text-accent">→</span>
            <span>Expand</span><span className="text-accent">→</span>
            <span>Pivot</span><span className="text-accent">→</span>
            <span>Correlate</span>
          </div>

          <div className="text-[10px] text-muted/30 mt-1">Press / to search · ? for shortcuts</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-bg min-h-0">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2.5}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="var(--rf-dot)" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => {
            const node = nodes.find(fn => fn.id === n.id)
            return node ? riskColor(node.riskLevel) : '#6b7280'
          }}
          maskColor="var(--color-bg)99"
          style={{ width: 120, height: 80 }}
        />
      </ReactFlow>
    </div>
  )
}