import type { ScannerProvider, EnrichmentResult, IndicatorType, RelationshipHint } from '@/types'
import { proxyFetch } from '@/utils/proxyFetch'

export class WhoisScanner implements ScannerProvider {
  name = 'WHOIS'
  supportedTypes: IndicatorType[] = ['domain', 'ip']

  async scan(indicator: string, type: IndicatorType, _apiKey: string): Promise<EnrichmentResult> {
    const res = await proxyFetch(`https://rdap.org/${type === 'ip' ? 'ip' : 'domain'}/${indicator}`)
    if (!res.ok) throw new Error(`RDAP HTTP ${res.status}`)
    const data = await res.json() as Record<string, unknown>

    const tags: string[] = []
    const relationships: RelationshipHint[] = []

    if (type === 'domain') {
      const nameservers = (data.nameservers as { ldhName: string }[]) ?? []
      nameservers.slice(0, 3).forEach(ns => {
        relationships.push({ targetLabel: ns.ldhName, targetType: 'Infrastructure', edgeType: 'resolves_to' })
      })
      const status = (data.status as string[]) ?? []
      tags.push(...status.slice(0, 3))
    }

    if (type === 'ip') {
      const name = data.name as string | undefined
      const country = data.country as string | undefined
      if (name) tags.push(name)
      if (country) tags.push(country)
    }

    return {
      provider: 'WHOIS', indicatorType: type, indicator,
      riskScore: 0, confidence: 0.6, tags,
      relationships, rawData: data, timestamp: Date.now(),
    }
  }
}
