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
  const r = 20
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = riskColor(riskLevelFromScore(score))
  return (
    <svg width="48" height="48" className="flex-shrink-0">
      <circle cx="24" cy="24" r={r} fill="none" stroke={color + '22'} strokeWidth="3" />
      <circle
        cx="24" cy="24" r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <text x="24" y="28" textAnchor="middle" fontSize="10" fontFamily="monospace"
        fill={color} fontWeight="600">
        {score}
      </text>
    </svg>
  )
}

function FenrirNodeComponent({ data, selected }: NodeProps) {
  const node = data as unknown as FenrirNode
  const indicatorColor = node.indicatorType ? INDICATOR_COLORS[node.indicatorType] : '#7c3aed'
  const rc = riskColor(node.riskLevel)

  return (
    <div
      className={clsx(
        'relative rounded-2xl transition-all duration-200 select-none overflow-hidden',
        'min-w-[160px] max-w-[220px]',
        node.loading && 'node-loading',
        selected && 'ring-2 ring-white/40 ring-offset-1 ring-offset-transparent'
      )}
      style={{
        background: `linear-gradient(135deg, ${riskBg(node.riskLevel)}, ${riskBg(node.riskLevel)}88)`,
        border: `1.5px solid ${rc}55`,
        boxShadow: selected ? `0 0 0 2px ${rc}44, 0 4px 20px ${rc}22` : `0 2px 8px ${rc}11`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <Handle type="target" position={Position.Top}
        style={{ background: rc, border: '2px solid #0a0a0f', width: 8, height: 8, top: -4 }} />

      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${indicatorColor}, ${rc})` }} />

      <div className="p-3">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2 gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm flex-shrink-0" style={{ color: indicatorColor }}>
              {TYPE_ICONS[node.type] ?? '◎'}
            </span>
            <span className="text-[9px] uppercase tracking-widest font-medium flex-shrink-0"
              style={{ color: rc + 'cc' }}>
              {node.indicatorType ?? node.type}
            </span>
          </div>
          {node.enriched && (
            <span className="text-[8px] text-safe bg-safe/10 px-1 py-0.5 rounded-full flex-shrink-0">✓ enriched</span>
          )}
        </div>

        {/* Label */}
        <div className="font-mono text-[11px] leading-tight break-all mb-2"
          style={{ color: 'var(--color-text)' }}>
          {node.label.length > 30 ? node.label.slice(0, 28) + '…' : node.label}
        </div>

        {/* Risk + score */}
        {node.enriched && node.riskScore > 0 ? (
          <div className="flex items-center gap-2">
            <RiskRing score={node.riskScore} />
            <div>
              <div className="text-[9px] uppercase tracking-wide" style={{ color: rc }}>
                {node.riskLevel}
              </div>
              <div className="text-[9px] text-muted">risk score</div>
            </div>
          </div>
        ) : node.loading ? (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span className="text-[9px] text-muted animate-pulse">scanning...</span>
          </div>
        ) : (
          <div className="text-[9px] text-muted">click to enrich</div>
        )}

        {/* Tags preview */}
        {node.enriched && (
          <div className="flex flex-wrap gap-1 mt-2">
            {((data as unknown as { _tags?: string[] })._tags ?? []).slice(0, 2).map((t: string) => (
              <span key={t} className="text-[8px] px-1 py-0.5 rounded bg-border text-muted">{t}</span>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom}
        style={{ background: rc, border: '2px solid #0a0a0f', width: 8, height: 8, bottom: -4 }} />
    </div>
  )
}

const nodeTypes = { fenrirNode: FenrirNodeComponent }

export default function GraphCanvas() {
  const { nodes, edges, selectedNodeId, selectNode, updateNodePosition, enrichmentResults } = useStore()

  const rfNodes = useMemo(() =>
    toReactFlowNodes(nodes).map(n => {
      const results = enrichmentResults[n.id] ?? []
      const tags = results.flatMap(r => r.tags).slice(0, 3)
      return {
        ...n,
        selected: n.id === selectedNodeId,
        data: { ...n.data, _tags: tags },
      }
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

  const onNodeClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
    selectNode(node.id)
  }, [selectNode])

  const onPaneClick = useCallback(() => selectNode(null), [selectNode])

  if (nodes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg gap-6 relative overflow-hidden">
        {/* Background grid effect */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse at 50% 50%, var(--color-accent-glow) 0%, transparent 65%)' }} />

        <div className="relative flex flex-col items-center gap-4 px-6 text-center">
          {/* Animated hex */}
          <div className="relative">
            <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-30">
              <polygon points="40,5 70,22.5 70,57.5 40,75 10,57.5 10,22.5"
                fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
              <polygon points="40,15 62,27.5 62,52.5 40,65 18,52.5 18,27.5"
                fill="none" stroke="var(--color-accent)" strokeWidth="0.75" opacity="0.5" />
              <circle cx="40" cy="5"  r="2.5" fill="var(--color-accent)" />
              <circle cx="70" cy="22.5" r="2.5" fill="var(--color-accent)" />
              <circle cx="70" cy="57.5" r="2.5" fill="var(--color-accent)" />
              <circle cx="40" cy="75" r="2.5" fill="var(--color-accent)" />
              <circle cx="10" cy="57.5" r="2.5" fill="var(--color-accent)" />
              <circle cx="10" cy="22.5" r="2.5" fill="var(--color-accent)" />
              <text x="40" y="44" textAnchor="middle" fontSize="18" fontWeight="700"
                fill="var(--color-accent)" fontFamily="monospace">F</text>
            </svg>
          </div>

          <div>
            <h1 className="text-xl font-bold text-text tracking-tight">Fenrir</h1>
            <p className="text-sm text-muted mt-1">Graph-native threat intelligence</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {['IP Address', 'Domain', 'URL', 'File Hash'].map(t => (
              <span key={t} className="text-[11px] px-2.5 py-1 rounded-full border border-border text-muted">
                {t}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted/50 font-mono mt-1">
            <span>Search</span><span className="text-accent">→</span>
            <span>Expand</span><span className="text-accent">→</span>
            <span>Pivot</span><span className="text-accent">→</span>
            <span>Correlate</span>
          </div>
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
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2.5}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1}
          color="var(--rf-dot)" />
        <Controls showInteractive={false} className="!bottom-4 !left-4" />
        <MiniMap
          nodeColor={(n) => {
            const node = nodes.find(fn => fn.id === n.id)
            return node ? riskColor(node.riskLevel) : '#6b7280'
          }}
          maskColor="var(--color-bg)99"
          className="!bottom-4 !right-4 !rounded-xl overflow-hidden"
          style={{ width: 120, height: 80 }}
        />
      </ReactFlow>
    </div>
  )
        }
