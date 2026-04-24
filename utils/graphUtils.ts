import dagre from 'dagre'
import type { FenrirNode, FenrirEdge, LayoutType } from '@/types'
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react'
import { riskColor, riskBg } from './riskScoring'

const NODE_W = 160
const NODE_H = 60

export function toReactFlowNodes(nodes: FenrirNode[]): RFNode[] {
  return nodes.map(n => ({
    id: n.id,
    type: 'fenrirNode',
    position: n.position ?? { x: 0, y: 0 },
    data: { ...n },
    style: {
      background: riskBg(n.riskLevel),
      border: `1.5px solid ${riskColor(n.riskLevel)}`,
      borderRadius: '8px',
      padding: '8px 12px',
      minWidth: NODE_W,
      fontSize: '12px',
      color: '#e2e8f0',
    },
  }))
}

export function toReactFlowEdges(edges: FenrirEdge[]): RFEdge[] {
  return edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label ?? e.type,
    type: 'smoothstep',
    animated: e.type === 'communicates_with',
    style: { stroke: '#7c3aed', strokeWidth: 1.5 },
    labelStyle: { fill: '#94a3b8', fontSize: 10 },
    labelBgStyle: { fill: '#111118' },
  }))
}

export function applyDagreLayout(
  nodes: FenrirNode[],
  edges: FenrirEdge[],
  direction: 'TB' | 'LR' = 'TB'
): FenrirNode[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, ranksep: 80, nodesep: 60 })

  nodes.forEach(n => g.setNode(n.id, { width: NODE_W, height: NODE_H }))
  edges.forEach(e => g.setEdge(e.source, e.target))

  dagre.layout(g)

  return nodes.map(n => {
    const pos = g.node(n.id)
    return {
      ...n,
      position: pos
        ? { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 }
        : n.position ?? { x: 0, y: 0 },
    }
  })
}

export function applyRadialLayout(nodes: FenrirNode[]): FenrirNode[] {
  if (nodes.length === 0) return nodes
  const cx = 400
  const cy = 300
  const radius = 220
  return nodes.map((n, i) => {
    if (i === 0) return { ...n, position: { x: cx, y: cy } }
    const angle = ((i - 1) / (nodes.length - 1)) * 2 * Math.PI
    return {
      ...n,
      position: {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      },
    }
  })
}

export function applyLayout(
  nodes: FenrirNode[],
  edges: FenrirEdge[],
  layout: LayoutType
): FenrirNode[] {
  switch (layout) {
    case 'dagre':  return applyDagreLayout(nodes, edges)
    case 'radial': return applyRadialLayout(nodes)
    default:       return nodes
  }
}

export function makeNodeId(label: string): string {
  return `node-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`
}

export function makeEdgeId(source: string, target: string, type: string): string {
  return `edge-${source}-${target}-${type}`
}
