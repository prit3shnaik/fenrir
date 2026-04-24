import { useCallback } from 'react'
import { useStore } from '@/store/useStore'
import { useEnrichment } from './useEnrichment'
import { detectIndicatorType } from '@/scanners'
import { makeNodeId } from '@/utils/graphUtils'
import type { FenrirNode } from '@/types'

export function useInvestigation() {
  const { addNode, applyCurrentLayout, resetGraph } = useStore()
  const { enrich } = useEnrichment()

  const investigate = useCallback(async (indicator: string) => {
    const trimmed = indicator.trim()
    if (!trimmed) return

    const type = detectIndicatorType(trimmed)
    const nodeId = makeNodeId(trimmed)

    const rootNode: FenrirNode = {
      id: nodeId,
      label: trimmed,
      type: 'Indicator',
      indicatorType: type,
      riskScore: 0,
      riskLevel: 'unknown',
      confidence: 1,
      notes: '',
      enriched: false,
      loading: true,
      metadata: {},
      position: { x: 400, y: 300 },
      createdAt: Date.now(),
    }

    addNode(rootNode)
    applyCurrentLayout()
    await enrich(nodeId, trimmed, type)
  }, [addNode, applyCurrentLayout, enrich])

  const pivotNode = useCallback(async (nodeId: string, label: string) => {
    const type = detectIndicatorType(label)
    await enrich(nodeId, label, type)
  }, [enrich])

  const newInvestigation = useCallback((indicator: string) => {
    resetGraph()
    investigate(indicator)
  }, [resetGraph, investigate])

  return { investigate, pivotNode, newInvestigation }
}
