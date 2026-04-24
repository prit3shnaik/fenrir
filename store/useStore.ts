import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  FenrirNode, FenrirEdge, InvestigationState,
  EnrichmentResult, GraphMode, LayoutType, ApiKeys
} from '@/types'
import { applyLayout } from '@/utils/graphUtils'

interface Actions {
  setApiKeys: (keys: Partial<ApiKeys>) => void
  addNode: (node: FenrirNode) => void
  addEdge: (edge: FenrirEdge) => void
  upsertNode: (node: FenrirNode) => void
  selectNode: (id: string | null) => void
  setNodeLoading: (id: string, loading: boolean) => void
  setEnrichmentResults: (nodeId: string, results: EnrichmentResult[]) => void
  updateNodeFromEnrichment: (nodeId: string, results: EnrichmentResult[]) => void
  setNodeNotes: (id: string, notes: string) => void
  setGraphMode: (mode: GraphMode) => void
  setLayout: (layout: LayoutType) => void
  applyCurrentLayout: () => void
  resetGraph: () => void
  loadGraph: (nodes: FenrirNode[], edges: FenrirEdge[]) => void
  updateNodePosition: (id: string, position: { x: number; y: number }) => void
}

const initialState: InvestigationState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  graphMode: 'infrastructure',
  layout: 'dagre',
  apiKeys: { virustotal: '', urlscan: '', abuseipdb: '', otx: '', triage: '' },
  loading: false,
  enrichmentResults: {},
}

export const useStore = create<InvestigationState & Actions>()(
  immer((set, get) => ({
    ...initialState,

    setApiKeys: (keys) => set(s => { Object.assign(s.apiKeys, keys) }),

    addNode: (node) => set(s => {
      if (!s.nodes.find(n => n.id === node.id)) s.nodes.push(node)
    }),

    upsertNode: (node) => set(s => {
      const idx = s.nodes.findIndex(n => n.id === node.id)
      if (idx >= 0) s.nodes[idx] = node
      else s.nodes.push(node)
    }),

    addEdge: (edge) => set(s => {
      if (!s.edges.find(e => e.id === edge.id)) s.edges.push(edge)
    }),

    selectNode: (id) => set(s => { s.selectedNodeId = id }),

    setNodeLoading: (id, loading) => set(s => {
      const n = s.nodes.find(n => n.id === id)
      if (n) n.loading = loading
    }),

    setEnrichmentResults: (nodeId, results) => set(s => {
      s.enrichmentResults[nodeId] = results
    }),

    updateNodeFromEnrichment: (nodeId, results) => set(s => {
      const node = s.nodes.find(n => n.id === nodeId)
      if (!node) return
      const { aggregateRiskScore, riskLevelFromScore } = require('@/utils/riskScoring')
      node.riskScore = aggregateRiskScore(results)
      node.riskLevel = riskLevelFromScore(node.riskScore)
      node.enriched = true
      node.loading = false
      s.enrichmentResults[nodeId] = results
    }),

    setNodeNotes: (id, notes) => set(s => {
      const n = s.nodes.find(n => n.id === id)
      if (n) n.notes = notes
    }),

    setGraphMode: (mode) => set(s => { s.graphMode = mode }),

    setLayout: (layout) => set(s => { s.layout = layout }),

    applyCurrentLayout: () => set(s => {
      const laid = applyLayout(s.nodes as FenrirNode[], s.edges as FenrirEdge[], s.layout)
      laid.forEach((n, i) => { s.nodes[i].position = n.position })
    }),

    resetGraph: () => set(() => ({ ...initialState })),

    loadGraph: (nodes, edges) => set(s => {
      s.nodes = nodes
      s.edges = edges
      s.selectedNodeId = null
      s.enrichmentResults = {}
    }),

    updateNodePosition: (id, position) => set(s => {
      const n = s.nodes.find(n => n.id === id)
      if (n) n.position = position
    }),
  }))
)
