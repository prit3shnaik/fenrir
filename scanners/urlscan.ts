import type { ScannerProvider, EnrichmentResult, IndicatorType, RelationshipHint } from '@/types'

export class URLScanScanner implements ScannerProvider {
  name = 'URLScan'
  supportedTypes: IndicatorType[] = ['url', 'domain', 'ip']

  async scan(indicator: string, type: IndicatorType, apiKey: string): Promise<EnrichmentResult> {
    const searchQuery = type === 'url'
      ? `page.url:"${indicator}"`
      : type === 'domain'
      ? `page.domain:"${indicator}"`
      : `page.ip:"${indicator}"`

    const res = await fetch(
      `https://urlscan.io/api/v1/search/?q=${encodeURIComponent(searchQuery)}&size=5`,
      { headers: apiKey ? { 'API-Key': apiKey } : {} }
    )

    if (!res.ok) throw new Error(`URLScan HTTP ${res.status}`)
    const data = await res.json() as { results?: Record<string, unknown>[] }
    return this.parse(indicator, type, data)
  }

  private parse(indicator: string, type: IndicatorType, data: { results?: Record<string, unknown>[] }): EnrichmentResult {
    const results = data.results ?? []
    const relationships: RelationshipHint[] = []

    results.slice(0, 5).forEach(r => {
      const page = r.page as Record<string, unknown> | undefined
      if (page?.ip && page.ip !== indicator) {
        relationships.push({ targetLabel: String(page.ip), targetType: 'Infrastructure', edgeType: 'resolves_to' })
      }
      if (page?.domain && page.domain !== indicator) {
        relationships.push({ targetLabel: String(page.domain), targetType: 'Indicator', edgeType: 'related_to' })
      }
    })

    const verdicts = results.map(r => {
      const v = (r as Record<string, unknown>).verdicts as Record<string, unknown> | undefined
      const overall = v?.overall as Record<string, unknown> | undefined
      return overall?.score as number ?? 0
    })
    const avgScore = verdicts.length > 0
      ? Math.round(verdicts.reduce((a, b) => a + b, 0) / verdicts.length)
      : 0

    return {
      provider: 'URLScan',
      indicatorType: type,
      indicator,
      riskScore: Math.min(avgScore, 100),
      confidence: 0.75,
      tags: [],
      relationships,
      rawData: data as Record<string, unknown>,
      timestamp: Date.now(),
    }
  }
}
