import type { ScannerProvider, EnrichmentResult, IndicatorType } from '@/types'
import { proxyFetch } from '@/utils/proxyFetch'

export class GreyNoiseScanner implements ScannerProvider {
  name = 'GreyNoise'
  supportedTypes: IndicatorType[] = ['ip']

  async scan(indicator: string, type: IndicatorType, apiKey: string): Promise<EnrichmentResult> {
    if (!apiKey) throw new Error('GreyNoise API key not set')

    const res = await proxyFetch(`https://api.greynoise.io/v3/community/${indicator}`, {
      headers: { key: apiKey }
    })

    if (res.status === 404) {
      return {
        provider: 'GreyNoise', indicatorType: type, indicator,
        riskScore: 0, confidence: 0.7, tags: ['not-seen'],
        relationships: [], rawData: {}, timestamp: Date.now(),
      }
    }

    if (!res.ok) throw new Error(`GreyNoise HTTP ${res.status}`)
    const data = await res.json() as Record<string, unknown>

    const classification = data.classification as string | undefined
    const noise = data.noise as boolean | undefined
    const riot = data.riot as boolean | undefined
    let riskScore = 0
    const tags: string[] = []

    if (classification === 'malicious') { riskScore = 85; tags.push('malicious') }
    else if (classification === 'benign') { riskScore = 5; tags.push('benign') }
    else riskScore = 30

    if (noise) tags.push('internet-noise')
    if (riot) { riskScore = Math.max(0, riskScore - 30); tags.push('common-service') }
    const name = data.name as string | undefined
    if (name) tags.push(name)

    return {
      provider: 'GreyNoise', indicatorType: type, indicator,
      riskScore, confidence: 0.85, tags,
      relationships: [], rawData: data, timestamp: Date.now(),
    }
  }
}
