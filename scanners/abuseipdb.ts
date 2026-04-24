import type { ScannerProvider, EnrichmentResult, IndicatorType } from '@/types'

export class AbuseIPDBScanner implements ScannerProvider {
  name = 'AbuseIPDB'
  supportedTypes: IndicatorType[] = ['ip']

  async scan(indicator: string, _type: IndicatorType, apiKey: string): Promise<EnrichmentResult> {
    if (!apiKey) throw new Error('AbuseIPDB API key not set')

    const res = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${indicator}&maxAgeInDays=90&verbose`,
      { headers: { Key: apiKey, Accept: 'application/json' } }
    )

    if (!res.ok) throw new Error(`AbuseIPDB HTTP ${res.status}`)
    const data = await res.json() as { data?: Record<string, unknown> }
    const d = data.data ?? {}

    return {
      provider: 'AbuseIPDB',
      indicatorType: 'ip',
      indicator,
      riskScore: (d.abuseConfidenceScore as number) ?? 0,
      confidence: 0.85,
      tags: d.usageType ? [String(d.usageType)] : [],
      relationships: [],
      rawData: data as Record<string, unknown>,
      timestamp: Date.now(),
    }
  }
}
