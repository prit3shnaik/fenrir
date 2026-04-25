import type { ScannerProvider, EnrichmentResult, IndicatorType, RelationshipHint } from '@/types'
import { proxyFetch } from '@/utils/proxyFetch'

export class WebCheckScanner implements ScannerProvider {
  name = 'WebCheck'
  supportedTypes: IndicatorType[] = ['domain', 'url']

  async scan(indicator: string, type: IndicatorType, _apiKey: string): Promise<EnrichmentResult> {
    const domain = type === 'url'
      ? new URL(indicator.startsWith('http') ? indicator : `https://${indicator}`).hostname
      : indicator

    const relationships: RelationshipHint[] = []
    let riskScore = 0

    try {
      const res = await proxyFetch(`https://api.webcheck.pro/report?url=${encodeURIComponent(domain)}`)
      if (res.ok) {
        const data = await res.json() as Record<string, unknown>
        const headers = data.headers as Record<string, unknown> | undefined
        if (headers) {
          const missing = ['strict-transport-security', 'x-content-type-options', 'x-frame-options']
            .filter(h => !headers[h])
          riskScore += missing.length * 10
        }
        const dns = data.dns as { ip?: string[] } | undefined
        dns?.ip?.slice(0, 3).forEach(ip => {
          relationships.push({ targetLabel: ip, targetType: 'Infrastructure', edgeType: 'resolves_to' })
        })
        return {
          provider: 'WebCheck', indicatorType: type, indicator,
          riskScore: Math.min(riskScore, 100), confidence: 0.6,
          tags: [], relationships, rawData: data, timestamp: Date.now(),
        }
      }
    } catch { /* fallback */ }

    return {
      provider: 'WebCheck', indicatorType: type, indicator,
      riskScore: 0, confidence: 0.3, tags: [],
      relationships, rawData: {},
      error: 'WebCheck unavailable',
      timestamp: Date.now(),
    }
  }
}
