import type { ScannerProvider, EnrichmentResult, IndicatorType, RelationshipHint } from '@/types'
import { proxyFetch } from '@/utils/proxyFetch'

export class IPApiScanner implements ScannerProvider {
  name = 'IPApi'
  supportedTypes: IndicatorType[] = ['ip']

  async scan(indicator: string, type: IndicatorType, _apiKey: string): Promise<EnrichmentResult> {
    const res = await proxyFetch(
      `http://ip-api.com/json/${indicator}?fields=status,message,country,countryCode,region,regionName,city,isp,org,as,proxy,hosting,query`
    )
    if (!res.ok) throw new Error(`ip-api HTTP ${res.status}`)
    const data = await res.json() as Record<string, unknown>

    if (data.status === 'fail') {
      throw new Error(String(data.message ?? 'ip-api lookup failed'))
    }

    const tags: string[] = []
    const relationships: RelationshipHint[] = []

    const country = data.country as string | undefined
    const countryCode = data.countryCode as string | undefined
    const city = data.city as string | undefined
    const isp = data.isp as string | undefined
    const org = data.org as string | undefined
    const asn = data.as as string | undefined
    const isProxy = data.proxy as boolean | undefined
    const isHosting = data.hosting as boolean | undefined

    if (country) tags.push(`${countryCode ?? ''} ${country}`.trim())
    if (city) tags.push(city)
    if (isp) tags.push(isp)
    if (isProxy) tags.push('proxy')
    if (isHosting) tags.push('hosting-provider')

    if (org) {
      relationships.push({
        targetLabel: org,
        targetType: 'Infrastructure',
        edgeType: 'hosts',
        metadata: { asn },
      })
    }

    const riskScore = isProxy ? 40 : isHosting ? 20 : 0

    return {
      provider: 'IPApi',
      indicatorType: type,
      indicator,
      riskScore,
      confidence: 0.8,
      tags,
      relationships,
      rawData: data,
      timestamp: Date.now(),
    }
  }
}