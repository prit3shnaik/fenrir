import type { FenrirNode, FenrirEdge, SavedCase } from '@/types'

export function exportJSON(nodes: FenrirNode[], edges: FenrirEdge[]): string {
  return JSON.stringify({ nodes, edges, exportedAt: new Date().toISOString() }, null, 2)
}

export function exportSTIX(nodes: FenrirNode[], edges: FenrirEdge[]): string {
  const objects = nodes.map(n => ({
    type: 'indicator',
    spec_version: '2.1',
    id: `indicator--${n.id}`,
    name: n.label,
    pattern_type: 'stix',
    pattern: `[ipv4-addr:value = '${n.label}']`,
    valid_from: new Date(n.createdAt).toISOString(),
    confidence: Math.round(n.confidence * 100),
    labels: [n.riskLevel],
    extensions: {
      'x-fenrir': {
        nodeType: n.type,
        riskScore: n.riskScore,
        metadata: n.metadata,
      },
    },
  }))

  const relationships = edges.map(e => ({
    type: 'relationship',
    spec_version: '2.1',
    id: `relationship--${e.id}`,
    relationship_type: e.type,
    source_ref: `indicator--${e.source}`,
    target_ref: `indicator--${e.target}`,
  }))

  const bundle = {
    type: 'bundle',
    id: `bundle--fenrir-${Date.now()}`,
    objects: [...objects, ...relationships],
  }

  return JSON.stringify(bundle, null, 2)
}

export function downloadFile(content: string, filename: string, mime = 'application/json'): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function caseToSaved(
  id: string,
  name: string,
  nodes: FenrirNode[],
  edges: FenrirEdge[]
): SavedCase {
  const now = Date.now()
  return { id, name, nodes, edges, notes: '', createdAt: now, updatedAt: now }
}
