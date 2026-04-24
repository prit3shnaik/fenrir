import type { ScannerProvider, EnrichmentResult, IndicatorType } from '@/types'

export class TriageScanner implements ScannerProvider {
  name = 'Triage'
  supportedTypes: IndicatorType[] = ['hash', 'url']

  async scan(indicator: string, type: IndicatorType, apiKey: string): Promise<EnrichmentResult> {
    if (!apiKey) throw new Error('Triage API key not set')

    const query = type === 'hash' ? `sha256:${indicator}` : indicator
    const res = await fetch(
      `https://tria.ge/api/v0/search?query=${encodeURIComponent(query)}&limit=5`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    )

    if (!res.ok) throw new Error(`Triage HTTP ${res.status}`)
    const data = await res.json() as { data?: Record<string, unknown>[] }
    const samples = data.data ?? []

    const scores = samples.map(s => (s.score as number) ?? 0).filter(Boolean)
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0

    const tags: string[] = []
    samples.forEach(s => {
      const t = s.tags as string[] | undefined
      if (t) tags.push(...t)
    })

    return {
      provider: 'Triage',
      indicatorType: type,
      indicator,
      riskScore: Math.round((maxScore / 10) * 100),
      confidence: 0.85,
      tags: [...new Set(tags)].slice(0, 10),
      relationships: [],
      rawData: data as Record<string, unknown>,
      timestamp: Date.now(),
    }
  }
}
