import type { ScannerProvider, EnrichmentResult, IndicatorType } from '@/types'
import { proxyFetch } from '@/utils/proxyFetch'

export class PhishTankScanner implements ScannerProvider {
  name = 'PhishTank'
  supportedTypes: IndicatorType[] = ['url', 'domain']

  async scan(indicator: string, type: IndicatorType, apiKey: string): Promise<EnrichmentResult> {
    const url = type === 'domain'
      ? `http://${indicator}`
      : indicator

    const body = new URLSearchParams({
      url: url,
      format: 'json',
      ...(apiKey ? { app_key: apiKey } : {}),
    })

    const res = await proxyFetch('https://checkurl.phishtank.com/checkurl/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!res.ok) throw new Error(`PhishTank HTTP ${res.status}`)
    const data = await res.json() as {
      results?: {
        in_database?: boolean
        valid?: boolean
        verified?: boolean
        verified_at?: string
        phish_detail_url?: string
      }
    }

    const results = data.results ?? {}
    const inDb = results.in_database ?? false
    const isPhish = results.valid ?? false
    const verified = results.verified ?? false

    const tags: string[] = []
    if (inDb) tags.push('in-phishtank')
    if (isPhish) tags.push('phishing')
    if (verified) tags.push('verified-phish')
    if (!inDb) tags.push('not-in-database')

    let riskScore = 0
    if (isPhish && verified) riskScore = 95
    else if (isPhish) riskScore = 80
    else if (inDb) riskScore = 50

    return {
      provider: 'PhishTank',
      indicatorType: type,
      indicator,
      riskScore,
      confidence: verified ? 0.95 : 0.75,
      tags,
      relationships: [],
      rawData: data as Record<string, unknown>,
      timestamp: Date.now(),
    }
  }
}