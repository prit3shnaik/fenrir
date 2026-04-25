import { create } from 'zustand'
import type {
  FenrirNode, FenrirEdge, InvestigationState,
  EnrichmentResult, GraphMode, LayoutType, ApiKeys
} from '@/types'
import { applyLayout } from '@/utils/graphUtils'
import { aggregateRiskScore, riskLevelFromScore } from '@/utils/riskScoring'

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
  toggleTheme: () => void
}

const initialState: InvestigationState = {
  nodes: [],
  edges: [],
  selectedNodeId: null,
  graphMode: 'infrastructure',
  layout: 'dagre',
  apiKeys: { virustotal: '', urlscan: '', abuseipdb: '', otx: '', triage: '', shodan: '', greynoise: '', claude: '' },
  loading: false,
  enrichmentResults: {},
  theme: 'dark',
}

export const useStore = create<InvestigationState & Actions>()((set) => ({
  ...initialState,

  setApiKeys: (keys) => set(s => ({ apiKeys: { ...s.apiKeys, ...keys } })),

  addNode: (node) => set(s => {
    if (s.nodes.find(n => n.id === node.id)) return s
    return { nodes: [...s.nodes, node] }
  }),

  upsertNode: (node) => set(s => {
    const idx = s.nodes.findIndex(n => n.id === node.id)
    if (idx >= 0) {
      const nodes = [...s.nodes]
      nodes[idx] = node
      return { nodes }
    }
    return { nodes: [...s.nodes, node] }
  }),

  addEdge: (edge) => set(s => {
    if (s.edges.find(e => e.id === edge.id)) return s
    return { edges: [...s.edges, edge] }
  }),

  selectNode: (id) => set(() => ({ selectedNodeId: id })),

  setNodeLoading: (id, loading) => set(s => ({
    nodes: s.nodes.map(n => n.id === id ? { ...n, loading } : n)
  })),

  setEnrichmentResults: (nodeId, results) => set(s => ({
    enrichmentResults: { ...s.enrichmentResults, [nodeId]: results }
  })),

  updateNodeFromEnrichment: (nodeId, results) => set(s => {
    const riskScore = aggregateRiskScore(results)
    const riskLevel = riskLevelFromScore(riskScore)
    return {
      nodes: s.nodes.map(n =>
        n.id === nodeId
          ? { ...n, riskScore, riskLevel, enriched: true, loading: false }
          : n
      ),
      enrichmentResults: { ...s.enrichmentResults, [nodeId]: results },
    }
  }),

  setNodeNotes: (id, notes) => set(s => ({
    nodes: s.nodes.map(n => n.id === id ? { ...n, notes } : n)
  })),

  setGraphMode: (mode) => set(() => ({ graphMode: mode })),
  setLayout: (layout) => set(() => ({ layout })),

  applyCurrentLayout: () => set(s => ({
    nodes: applyLayout(s.nodes, s.edges, s.layout)
  })),

  resetGraph: () => set(s => ({ ...initialState, theme: s.theme, apiKeys: s.apiKeys })),

  loadGraph: (nodes, edges) => set(() => ({
    nodes, edges, selectedNodeId: null, enrichmentResults: {}
  })),

  updateNodePosition: (id, position) => set(s => ({
    nodes: s.nodes.map(n => n.id === id ? { ...n, position } : n)
  })),

  toggleTheme: () => set(s => {
    const next = s.theme === 'dark' ? 'light' : 'dark'
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next === 'dark')
      document.documentElement.classList.toggle('light', next === 'light')
    }
    return { theme: next }
  }),
}))
