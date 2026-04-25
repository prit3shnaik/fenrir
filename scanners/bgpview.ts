import type { ScannerProvider, EnrichmentResult, IndicatorType, RelationshipHint } from '@/types'

export class BGPViewScanner implements ScannerProvider {
  name = 'BGPView'
  supportedTypes: IndicatorType[] = ['ip']

  async scan(indicator: string, type: IndicatorType, _apiKey: string): Promise<EnrichmentResult> {
    const res = await fetch(`https://api.bgpview.io/ip/${indicator}`)
    if (!res.ok) throw new Error(`BGPView HTTP ${res.status}`)
    const data = await res.json() as { data?: Record<string, unknown> }
    const d = data.data ?? {}

    const prefixes = (d.prefixes as Record<string, unknown>[]) ?? []
    const tags: string[] = []
    const relationships: RelationshipHint[] = []

    prefixes.slice(0, 3).forEach(p => {
      const asn = (p.asn as Record<string, unknown>)
      const asnNum = asn?.asn as number | undefined
      const asnName = asn?.name as string | undefined
      const country = asn?.country_code as string | undefined
      const prefix = p.prefix as string | undefined

      if (asnName) tags.push(asnName)
      if (country) tags.push(country)
      if (asnNum) {
        relationships.push({
          targetLabel: `AS${asnNum}${asnName ? ` (${asnName})` : ''}`,
          targetType: 'Infrastructure',
          edgeType: 'hosts',
        })
      }
      if (prefix) {
        relationships.push({ targetLabel: prefix, targetType: 'Infrastructure', edgeType: 'related_to' })
      }
    })

    return {
      provider: 'BGPView',
      indicatorType: type,
      indicator,
      riskScore: 0,
      confidence: 0.7,
      tags: [...new Set(tags)],
      relationships,
      rawData: data as Record<string, unknown>,
      timestamp: Date.now(),
    }
  }
}
