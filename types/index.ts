export type IndicatorType = 'ip' | 'domain' | 'url' | 'hash'

export type NodeType =
  | 'Indicator'
  | 'Infrastructure'
  | 'Threat'
  | 'IntelSource'
  | 'Verdict'

export type EdgeType =
  | 'resolves_to'
  | 'hosts'
  | 'related_to'
  | 'reported_by'
  | 'seen_with'
  | 'communicates_with'

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'unknown'

export interface FenrirNode {
  id: string
  label: string
  type: NodeType
  indicatorType?: IndicatorType
  riskScore: number
  riskLevel: RiskLevel
  confidence: number
  notes: string
  enriched: boolean
  loading: boolean
  metadata: Record<string, unknown>
  position?: { x: number; y: number }
  createdAt: number
}

export interface FenrirEdge {
  id: string
  source: string
  target: string
  type: EdgeType
  label?: string
  metadata?: Record<string, unknown>
}

export interface EnrichmentResult {
  provider: string
  indicatorType: IndicatorType
  indicator: string
  riskScore: number
  confidence: number
  tags: string[]
  relationships: RelationshipHint[]
  rawData: Record<string, unknown>
  error?: string
  timestamp: number
}

export interface RelationshipHint {
  targetLabel: string
  targetType: NodeType
  edgeType: EdgeType
  metadata?: Record<string, unknown>
}

export interface ScannerProvider {
  name: string
  supportedTypes: IndicatorType[]
  scan(indicator: string, type: IndicatorType, apiKey: string): Promise<EnrichmentResult>
}

export interface ApiKeys {
  virustotal: string
  urlscan: string
  abuseipdb: string
  otx: string
  triage: string
  shodan: string
  greynoise: string
  claude: string
  [key: string]: string
}

export interface SavedCase {
  id: string
  name: string
  nodes: FenrirNode[]
  edges: FenrirEdge[]
  notes: string
  createdAt: number
  updatedAt: number
}

export type GraphMode = 'infrastructure' | 'reputation' | 'campaign'
export type LayoutType = 'dagre' | 'radial' | 'force'

export interface InvestigationState {
  nodes: FenrirNode[]
  edges: FenrirEdge[]
  selectedNodeId: string | null
  graphMode: GraphMode
  layout: LayoutType
  apiKeys: ApiKeys
  loading: boolean
  enrichmentResults: Record<string, EnrichmentResult[]>
}
