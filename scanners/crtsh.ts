import type { ScannerProvider, EnrichmentResult, IndicatorType, RelationshipHint } from '@/types'

export class CrtShScanner implements ScannerProvider {
  name = 'crt.sh'
  supportedTypes: IndicatorType[] = ['domain']

  async scan(indicator: string, type: IndicatorType, _apiKey: string): Promise<EnrichmentResult> {
    const res = await fetch(
      `https://crt.sh/?q=%25.${indicator}&output=json`,
      { headers: { Accept: 'application/json' } }
    )

    if (!res.ok) throw new Error(`crt.sh HTTP ${res.status}`)
    const data = await res.json() as { name_value: string; issuer_name?: string }[]

    const subdomains = new Set<string>()
    const issuers = new Set<string>()

    data.slice(0, 50).forEach(cert => {
      const names = cert.name_value.split('\n')
      names.forEach(n => {
        const clean = n.trim().replace(/^\*\./, '')
        if (clean && clean !== indicator) subdomains.add(clean)
      })
      if (cert.issuer_name) {
        const cn = cert.issuer_name.match(/CN=([^,]+)/)?.[1]
        if (cn) issuers.add(cn)
      }
    })

    const relationships: RelationshipHint[] = []
    Array.from(subdomains).slice(0, 10).forEach(sub => {
      relationships.push({ targetLabel: sub, targetType: 'Indicator', edgeType: 'related_to' })
    })

    const riskScore = subdomains.size > 20 ? 30 : subdomains.size > 5 ? 15 : 0

    return {
      provider: 'crt.sh',
      indicatorType: type,
      indicator,
      riskScore,
      confidence: 0.75,
      tags: [`${subdomains.size} subdomains`, ...Array.from(issuers).slice(0, 2)],
      relationships,
      rawData: { subdomains: Array.from(subdomains), issuers: Array.from(issuers) },
      timestamp: Date.now(),
    }
  }
}
