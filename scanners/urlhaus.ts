import type { ScannerProvider, EnrichmentResult, IndicatorType, RelationshipHint } from '@/types'
import { proxyFetch } from '@/utils/proxyFetch'

export class URLHausScanner implements ScannerProvider {
  name = 'URLhaus'
  supportedTypes: IndicatorType[] = ['url', 'domain', 'ip', 'hash']

  async scan(indicator: string, type: IndicatorType, _apiKey: string): Promise<EnrichmentResult> {
    let body: string
    let endpoint: string

    if (type === 'hash') {
      endpoint = 'https://urlhaus-api.abuse.ch/v1/payload/'
      body = `md5_hash=${indicator}`
      if (indicator.length === 64) body = `sha256_hash=${indicator}`
    } else if (type === 'url') {
      endpoint = 'https://urlhaus-api.abuse.ch/v1/url/'
      body = `url=${encodeURIComponent(indicator)}`
    } else {
      endpoint = 'https://urlhaus-api.abuse.ch/v1/host/'
      body = `host=${indicator}`
    }

    const res = await proxyFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    if (!res.ok) throw new Error(`URLhaus HTTP ${res.status}`)
    const data = await res.json() as Record<string, unknown>

    const queryStatus = data.query_status as string | undefined
    const notFound = queryStatus === 'no_results' || queryStatus === 'invalid_url'

    if (notFound) {
      return {
        provider: 'URLhaus',
        indicatorType: type,
        indicator,
        riskScore: 0,
        confidence: 0.85,
        tags: ['not-found'],
        relationships: [],
        rawData: data,
        timestamp: Date.now(),
      }
    }

    const tags: string[] = []
    const relationships: RelationshipHint[] = []

    // URL/host mode
    const urls = (data.urls as Record<string, unknown>[]) ?? []
    const urlStatus = data.url_status as string | undefined
    const threat = data.threat as string | undefined

    if (urlStatus === 'online') { tags.push('online'); }
    if (urlStatus === 'offline') tags.push('offline')
    if (threat) tags.push(threat)

    urls.slice(0, 5).forEach(u => {
      const t = u.threat as string | undefined
      const tags2 = u.tags as string[] | undefined
      if (t) tags.push(t)
      if (tags2) tags.push(...tags2.slice(0, 3))
      const urlStr = u.url as string | undefined
      if (urlStr && type !== 'url') {
        relationships.push({
          targetLabel: urlStr,
          targetType: 'Indicator',
          edgeType: 'related_to',
        })
      }
    })

    // Hash/payload mode
    const malwareFamilies = (data.signature as string | undefined)
    if (malwareFamilies) {
      tags.push(malwareFamilies)
      relationships.push({
        targetLabel: malwareFamilies,
        targetType: 'Threat',
        edgeType: 'related_to',
      })
    }

    const fileType = data.file_type as string | undefined
    if (fileType) tags.push(fileType)

    const isOnline = urlStatus === 'online' || queryStatus === 'is_host'
    const hasUrls = urls.length > 0

    let riskScore = 0
    if (isOnline) riskScore = 85
    else if (hasUrls) riskScore = 65
    else if (data.sha256_hash) riskScore = 90 // found in payload DB = malware

    return {
      provider: 'URLhaus',
      indicatorType: type,
      indicator,
      riskScore,
      confidence: 0.9,
      tags: [...new Set(tags)].filter(Boolean),
      relationships,
      rawData: data,
      timestamp: Date.now(),
    }
  }
}