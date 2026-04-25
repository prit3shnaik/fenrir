import type { ScannerProvider, EnrichmentResult, IndicatorType, RelationshipHint } from '@/types'

export class ShodanScanner implements ScannerProvider {
  name = 'Shodan'
  supportedTypes: IndicatorType[] = ['ip']

  async scan(indicator: string, type: IndicatorType, apiKey: string): Promise<EnrichmentResult> {
    if (!apiKey) throw new Error('Shodan API key not set')

    const res = await fetch(`https://api.shodan.io/shodan/host/${indicator}?key=${apiKey}`)
    if (!res.ok) throw new Error(`Shodan HTTP ${res.status}`)
    const data = await res.json() as Record<string, unknown>

    const ports = (data.ports as number[]) ?? []
    const tags = (data.tags as string[]) ?? []
    const vulns = Object.keys((data.vulns as Record<string, unknown>) ?? {})
    const org = data.org as string | undefined
    const country = data.country_name as string | undefined

    const riskScore = Math.min(
      (vulns.length * 20) + (ports.length > 10 ? 20 : 0),
      100
    )

    const relationships: RelationshipHint[] = []
    if (org) relationships.push({ targetLabel: org, targetType: 'Infrastructure', edgeType: 'hosts' })

    return {
      provider: 'Shodan',
      indicatorType: type,
      indicator,
      riskScore,
      confidence: 0.9,
      tags: [...tags, ...vulns.slice(0, 5), country ?? ''].filter(Boolean),
      relationships,
      rawData: data,
      timestamp: Date.now(),
    }
  }
}
