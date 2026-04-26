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
      body = indicator.length === 64
        ? `sha256_hash=${encodeURIComponent(indicator)}`
        : `md5_hash=${encodeURIComponent(indicator)}`
    } else if (type === 'url') {
      endpoint = 'https://urlhaus-api.abuse.ch/v1/url/'
      body = `url=${encodeURIComponent(indicator)}`
    } else {
      // ip or domain → use host endpoint
      endpoint = 'https://urlhaus-api.abuse.ch/v1/host/'
      body = `host=${encodeURIComponent(indicator)}`
    }

    const res = await proxyFetch(endpoint, {
      method: 'POST',
      // URLhaus requires this exact content-type — no charset, no boundary
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    if (!res.ok) throw new Error(`URLhaus HTTP ${res.status}`)

    const data = await res.json() as Record<string, unknown>
    const queryStatus = data.query_status as string | undefined

    if (
      queryStatus === 'no_results' ||
      queryStatus === 'invalid_url' ||
      queryStatus === 'invalid_host' ||
      queryStatus === 'not_found'
    ) {
      return {
        provider: 'URLhaus', indicatorType: type, indicator,
        riskScore: 0, confidence: 0.85, tags: ['not-found'],
        relationships: [], rawData: data, timestamp: Date.now(),
      }
    }

    const tags: string[] = []
    const relationships: RelationshipHint[] = []

    const urlStatus    = data.url_status   as string | undefined
    const threat       = data.threat       as string | undefined
    const malwareName  = data.signature    as string | undefined
    const fileType     = data.file_type    as string | undefined
    const urls         = (data.urls        as Record<string, unknown>[]) ?? []

    if (urlStatus === 'online')  tags.push('online')
    if (urlStatus === 'offline') tags.push('offline')
    if (threat)      tags.push(threat)
    if (malwareName) {
      tags.push(malwareName)
      relationships.push({ targetLabel: malwareName, targetType: 'Threat', edgeType: 'related_to' })
    }
    if (fileType) tags.push(fileType)

    urls.slice(0, 5).forEach(u => {
      const t  = u.threat as string   | undefined
      const t2 = u.tags   as string[] | undefined
      if (t)  tags.push(t)
      if (t2) tags.push(...t2.slice(0, 3))
    })

    let riskScore = 0
    if (data.sha256_hash || data.md5_hash) riskScore = 90  // found in payload DB
    else if (urlStatus === 'online')        riskScore = 85
    else if (urls.length > 0)              riskScore = 60

    return {
      provider: 'URLhaus', indicatorType: type, indicator,
      riskScore, confidence: 0.9,
      tags: [...new Set(tags)].filter(Boolean),
      relationships, rawData: data, timestamp: Date.now(),
    }
  }
}