import type { ScannerProvider, EnrichmentResult, IndicatorType, RelationshipHint } from '@/types'

export class VirusTotalScanner implements ScannerProvider {
  name = 'VirusTotal'
  supportedTypes: IndicatorType[] = ['ip', 'domain', 'url', 'hash']

  async scan(indicator: string, type: IndicatorType, apiKey: string): Promise<EnrichmentResult> {
    if (!apiKey) throw new Error('VirusTotal API key not set')

    const endpoint = this.getEndpoint(indicator, type)
    const res = await fetch(endpoint, {
      headers: { 'x-apikey': apiKey },
    })

    if (!res.ok) throw new Error(`VT HTTP ${res.status}`)
    const data = await res.json()
    return this.parse(indicator, type, data)
  }

  private getEndpoint(indicator: string, type: IndicatorType): string {
    const base = 'https://www.virustotal.com/api/v3'
    switch (type) {
      case 'ip':     return `${base}/ip_addresses/${indicator}`
      case 'domain': return `${base}/domains/${indicator}`
      case 'hash':   return `${base}/files/${indicator}`
      case 'url': {
        const encoded = btoa(indicator).replace(/=+$/, '')
        return `${base}/urls/${encoded}`
      }
    }
  }

  private parse(indicator: string, type: IndicatorType, data: Record<string, unknown>): EnrichmentResult {
    const attrs = (data.data as Record<string, unknown>)?.attributes as Record<string, unknown> ?? {}
    const stats = attrs.last_analysis_stats as Record<string, number> ?? {}
    const malicious = stats.malicious ?? 0
    const total = Object.values(stats).reduce((a, b) => a + b, 0)
    const riskScore = total > 0 ? Math.round((malicious / total) * 100) : 0
    const tags = (attrs.tags as string[]) ?? []
    const relationships: RelationshipHint[] = []

    if (type === 'domain' || type === 'url') {
      const ip = attrs.last_dns_records as { value: string }[] | undefined
      ip?.slice(0, 3).forEach(r => {
        relationships.push({ targetLabel: r.value, targetType: 'Infrastructure', edgeType: 'resolves_to' })
      })
    }

    return {
      provider: 'VirusTotal',
      indicatorType: type,
      indicator,
      riskScore,
      confidence: 0.9,
      tags,
      relationships,
      rawData: data as Record<string, unknown>,
      timestamp: Date.now(),
    }
  }
}
