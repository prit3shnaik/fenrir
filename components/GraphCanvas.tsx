'use client'
import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Handle,
  Position,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useStore } from '@/store/useStore'
import { toReactFlowNodes, toReactFlowEdges } from '@/utils/graphUtils'
import { riskColor, riskBg } from '@/utils/riskScoring'
import type { FenrirNode } from '@/types'
import clsx from 'clsx'

// Custom node renderer
function FenrirNodeComponent({ data, selected }: NodeProps) {
  const node = data as unknown as FenrirNode
  return (
    <div
      className={clsx(
        'relative rounded-xl px-3 py-2 text-xs min-w-[130px] cursor-pointer transition-all select-none',
        node.loading && 'node-loading',
        selected && 'ring-2 ring-white/30'
      )}
      style={{
        background: riskBg(node.riskLevel),
        border: `1.5px solid ${riskColor(node.riskLevel)}`,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: riskColor(node.riskLevel), border: 'none', width: 6, height: 6 }} />
      <div className="text-[10px] text-muted uppercase tracking-wide mb-0.5">{node.type}</div>
      <div className="font-mono text-text text-[11px] break-all leading-tight">{node.label}</div>
      {node.riskScore > 0 && (
        <div className="mt-1 text-[10px] font-mono" style={{ color: riskColor(node.riskLevel) }}>
          {node.riskScore}/100
        </div>
      )}
      {node.loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg/60 rounded-xl">
          <span className="text-accent text-[10px] animate-pulse">scanning...</span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ background: riskColor(node.riskLevel), border: 'none', width: 6, height: 6 }} />
    </div>
  )
}

const nodeTypes = { fenrirNode: FenrirNodeComponent }

export default function GraphCanvas() {
  const { nodes, edges, selectedNodeId, selectNode, updateNodePosition } = useStore()

  const rfNodes = useMemo(() => {
    return toReactFlowNodes(nodes).map(n => ({
      ...n,
      selected: n.id === selectedNodeId,
    }))
  }, [nodes, selectedNodeId])

  const rfEdges = useMemo(() => toReactFlowEdges(edges), [edges])

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    changes.forEach(c => {
      if (c.type === 'position' && c.position) {
        updateNodePosition(c.id, c.position)
      }
    })
  }, [updateNodePosition])

  const onEdgesChange = useCallback((_changes: EdgeChange[]) => {
    // edges managed by store
  }, [])

  const onNodeClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
    selectNode(node.id)
  }, [selectNode])

  const onPaneClick = useCallback(() => {
    selectNode(null)
  }, [selectNode])

  if (nodes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg gap-4 relative">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, #7c3aed 0%, transparent 70%)',
          }}
        />
        <div className="text-6xl opacity-20 font-mono text-accent">⬡</div>
        <div className="text-center">
          <div className="text-text font-semibold text-lg mb-1">Fenrir</div>
          <div className="text-muted text-sm">Enter an IP, domain, URL or hash to begin investigation</div>
        </div>
        <div className="flex gap-2 text-xs text-muted/50 font-mono">
          <span>Search → Expand → Pivot → Correlate</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-bg">
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1e1e2e" />
        <Controls />
        <MiniMap
          nodeColor={(n) => {
            const node = nodes.find(fn => fn.id === n.id)
            return node ? riskColor(node.riskLevel) : '#6b7280'
          }}
          maskColor="#0a0a0f88"
        />
      </ReactFlow>
    </div>
  )
}
