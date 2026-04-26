import type { ScannerProvider, EnrichmentResult, IndicatorType } from '@/types'
import { proxyFetch } from '@/utils/proxyFetch'

export class PhishTankScanner implements ScannerProvider {
  name = 'PhishTank'
  supportedTypes: IndicatorType[] = ['url', 'domain']

  async scan(indicator: string, type: IndicatorType, apiKey: string): Promise<EnrichmentResult> {
    const targetUrl = type === 'domain'
      ? `http://${indicator}`
      : indicator

    // PhishTank requires app_key for non-trivial usage
    // Without key it rate-limits aggressively — gracefully return no-data
    if (!apiKey) {
      return {
        provider: 'PhishTank', indicatorType: type, indicator,
        riskScore: 0, confidence: 0,
        tags: [],
        relationships: [],
        rawData: {},
        error: 'PhishTank API key not set (optional)',
        timestamp: Date.now(),
      }
    }

    const body = new URLSearchParams({
      url:     targetUrl,
      format:  'json',
      app_key: apiKey,
    })

    try {
      const res = await proxyFetch('https://checkurl.phishtank.com/checkurl/', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent':   'fenrir-threat-intel/1.0',
        },
        body: body.toString(),
      })

      if (!res.ok) throw new Error(`PhishTank HTTP ${res.status}`)

      const data = await res.json() as {
        results?: {
          in_database?: boolean
          valid?:       boolean
          verified?:    boolean
        }
      }

      const r        = data.results ?? {}
      const inDb     = r.in_database ?? false
      const isPhish  = r.valid       ?? false
      const verified = r.verified    ?? false

      const tags: string[] = []
      if (inDb)     tags.push('in-phishtank')
      if (isPhish)  tags.push('phishing')
      if (verified) tags.push('verified-phish')
      if (!inDb)    tags.push('not-in-database')

      let riskScore = 0
      if (isPhish && verified) riskScore = 95
      else if (isPhish)        riskScore = 80
      else if (inDb)           riskScore = 50

      return {
        provider: 'PhishTank', indicatorType: type, indicator,
        riskScore, confidence: verified ? 0.95 : 0.7,
        tags, relationships: [],
        rawData: data as Record<string, unknown>,
        timestamp: Date.now(),
      }
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : 'PhishTank request failed')
    }
  }
}