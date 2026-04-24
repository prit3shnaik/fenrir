import type { EnrichmentResult, RiskLevel } from '@/types'

export function aggregateRiskScore(results: EnrichmentResult[]): number {
  if (results.length === 0) return 0
  const valid = results.filter(r => !r.error && r.riskScore >= 0)
  if (valid.length === 0) return 0
  const weightedSum = valid.reduce((acc, r) => acc + r.riskScore * r.confidence, 0)
  const totalWeight = valid.reduce((acc, r) => acc + r.confidence, 0)
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
}

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  if (score >= 10) return 'low'
  return 'unknown'
}

export function riskColor(level: RiskLevel): string {
  switch (level) {
    case 'critical': return '#ef4444'
    case 'high':     return '#f97316'
    case 'medium':   return '#f59e0b'
    case 'low':      return '#10b981'
    default:         return '#6b7280'
  }
}

export function riskBg(level: RiskLevel): string {
  switch (level) {
    case 'critical': return '#ef444420'
    case 'high':     return '#f9731620'
    case 'medium':   return '#f59e0b20'
    case 'low':      return '#10b98120'
    default:         return '#6b728020'
  }
}

export function nodeSizeFromScore(score: number): number {
  // Returns a multiplier 1.0–2.5 for node sizing
  return 1 + (score / 100) * 1.5
}
