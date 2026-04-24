import { useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { enrichIndicator, detectIndicatorType } from '@/scanners'
import { makeNodeId, makeEdgeId } from '@/utils/graphUtils'
import { riskLevelFromScore } from '@/utils/riskScoring'
import type { FenrirNode, FenrirEdge, IndicatorType } from '@/types'

export function useEnrichment() {
  const { apiKeys, addNode, addEdge, setNodeLoading, updateNodeFromEnrichment, applyCurrentLayout } = useStore()

  const enrich = useCallback(async (nodeId: string, indicator: string, type?: IndicatorType) => {
    const detectedType = type ?? detectIndicatorType(indicator)
    setNodeLoading(nodeId, true)

    try {
      const results = await enrichIndicator(indicator, detectedType, apiKeys)
      updateNodeFromEnrichment(nodeId, results)

      // Add relationship nodes/edges from enrichment
      const newNodes: FenrirNode[] = []
      const newEdges: FenrirEdge[] = []

      results.forEach(r => {
        r.relationships.forEach(rel => {
          const relNodeId = makeNodeId(rel.targetLabel)
          const newNode: FenrirNode = {
            id: relNodeId,
            label: rel.targetLabel,
            type: rel.targetType,
            riskScore: 0,
            riskLevel: 'unknown',
            confidence: r.confidence,
            notes: '',
            enriched: false,
            loading: false,
            metadata: rel.metadata ?? {},
            createdAt: Date.now(),
          }
          newNodes.push(newNode)
          newEdges.push({
            id: makeEdgeId(nodeId, relNodeId, rel.edgeType),
            source: nodeId,
            target: relNodeId,
            type: rel.edgeType,
            label: rel.edgeType.replace(/_/g, ' '),
          })
        })
      })

      newNodes.forEach(n => addNode(n))
      newEdges.forEach(e => addEdge(e))

      if (newNodes.length > 0) {
        setTimeout(() => applyCurrentLayout(), 50)
      }
    } catch (err) {
      setNodeLoading(nodeId, false)
      console.error('Enrichment error:', err)
    }
  }, [apiKeys, addNode, addEdge, setNodeLoading, updateNodeFromEnrichment, applyCurrentLayout])

  return { enrich }
}
