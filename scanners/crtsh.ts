import type { ScannerProvider, EnrichmentResult, IndicatorType, RelationshipHint } from '@/types'
import { proxyFetch } from '@/utils/proxyFetch'

export class CrtShScanner implements ScannerProvider {
  name = 'crt.sh'
  supportedTypes: IndicatorType[] = ['domain']

  async scan(indicator: string, type: IndicatorType, _apiKey: string): Promise<EnrichmentResult> {
    const res = await proxyFetch(
      `https://crt.sh/?q=%25.${indicator}&output=json`,
      { headers: { Accept: 'application/json' } }
    )
    if (!res.ok) throw new Error(`crt.sh HTTP ${res.status}`)
    const data = await res.json() as { name_value: string; issuer_name?: string }[]

    const subdomains = new Set<string>()
    const issuers = new Set<string>()

    data.slice(0, 50).forEach(cert => {
      cert.name_value.split('\n').forEach(n => {
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

    return {
      provider: 'crt.sh', indicatorType: type, indicator,
      riskScore: subdomains.size > 20 ? 30 : subdomains.size > 5 ? 15 : 0,
      confidence: 0.75,
      tags: [`${subdomains.size} subdomains`, ...Array.from(issuers).slice(0, 2)],
      relationships,
      rawData: { subdomains: Array.from(subdomains), issuers: Array.from(issuers) },
      timestamp: Date.now(),
    }
  }
}
