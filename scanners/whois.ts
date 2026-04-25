import type { ScannerProvider, EnrichmentResult, IndicatorType, RelationshipHint } from '@/types'

export class WhoisScanner implements ScannerProvider {
  name = 'WHOIS'
  supportedTypes: IndicatorType[] = ['domain', 'ip']

  async scan(indicator: string, type: IndicatorType, _apiKey: string): Promise<EnrichmentResult> {
    const domain = type === 'domain' ? indicator : indicator
    const res = await fetch(`https://rdap.org/${type === 'ip' ? 'ip' : 'domain'}/${domain}`)

    if (!res.ok) throw new Error(`RDAP HTTP ${res.status}`)
    const data = await res.json() as Record<string, unknown>

    const tags: string[] = []
    const relationships: RelationshipHint[] = []

    if (type === 'domain') {
      const entities = (data.entities as Record<string, unknown>[]) ?? []
      entities.forEach(e => {
        const vcardArray = e.vcardArray as unknown[][] | undefined
        if (vcardArray?.[1]) {
          const org = (vcardArray[1] as unknown[]).find(
            (v): v is string[] => Array.isArray(v) && v[0] === 'org'
          )
          if (org?.[3]) {
            relationships.push({ targetLabel: String(org[3]), targetType: 'Infrastructure', edgeType: 'related_to' })
          }
        }
      })

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
      const cidr = (data.cidr0s as { v4prefix?: string; v6prefix?: string }[]) ?? []
      cidr.slice(0, 2).forEach(c => {
        const prefix = c.v4prefix ?? c.v6prefix
        if (prefix) relationships.push({ targetLabel: prefix, targetType: 'Infrastructure', edgeType: 'related_to' })
      })
    }

    return {
      provider: 'WHOIS',
      indicatorType: type,
      indicator,
      riskScore: 0,
      confidence: 0.6,
      tags,
      relationships,
      rawData: data,
      timestamp: Date.now(),
    }
  }
}
