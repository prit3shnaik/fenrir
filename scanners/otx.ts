import type { ScannerProvider, EnrichmentResult, IndicatorType, RelationshipHint } from '@/types'
import { proxyFetch } from '@/utils/proxyFetch'

export class OTXScanner implements ScannerProvider {
  name = 'OTX'
  supportedTypes: IndicatorType[] = ['ip', 'domain', 'url', 'hash']

  async scan(indicator: string, type: IndicatorType, apiKey: string): Promise<EnrichmentResult> {
    if (!apiKey) throw new Error('OTX API key not set')

    const section = type === 'hash' ? 'file' : type === 'ip' ? 'IPv4' : type
    const res = await proxyFetch(
      `https://otx.alienvault.com/api/v1/indicators/${section}/${indicator}/general`,
      { headers: { 'X-OTX-API-KEY': apiKey } }
    )

    if (!res.ok) throw new Error(`OTX HTTP ${res.status}`)
    const data = await res.json() as Record<string, unknown>
    return this.parse(indicator, type, data)
  }

  private parse(indicator: string, type: IndicatorType, data: Record<string, unknown>): EnrichmentResult {
    const pulseCount = (data.pulse_info as Record<string, unknown>)?.count as number ?? 0
    const riskScore = Math.min(pulseCount * 10, 100)
    const tags: string[] = []
    const relationships: RelationshipHint[] = []

    const pulses = ((data.pulse_info as Record<string, unknown>)?.pulses as Record<string, unknown>[]) ?? []
    pulses.slice(0, 3).forEach(p => {
      const name = p.name as string | undefined
      if (name) relationships.push({ targetLabel: name, targetType: 'Threat', edgeType: 'reported_by' })
      const t = p.tags as string[] | undefined
      if (t) tags.push(...t.slice(0, 3))
    })

    return {
      provider: 'OTX',
      indicatorType: type,
      indicator,
      riskScore,
      confidence: 0.8,
      tags: [...new Set(tags)],
      relationships,
      rawData: data,
      timestamp: Date.now(),
    }
  }
}
