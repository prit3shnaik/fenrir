import type { ScannerProvider, EnrichmentResult, IndicatorType } from '@/types'
import { proxyFetch } from '@/utils/proxyFetch'

export class TorCheckScanner implements ScannerProvider {
  name = 'TorCheck'
  supportedTypes: IndicatorType[] = ['ip']

  async scan(indicator: string, type: IndicatorType, _apiKey: string): Promise<EnrichmentResult> {
    const res = await proxyFetch('https://check.torproject.org/torbulkexitlist')
    if (!res.ok) throw new Error(`TorCheck HTTP ${res.status}`)
    const text = await res.text()
    const exitNodes = new Set(text.split('\n').map(l => l.trim()).filter(Boolean))
    const isTor = exitNodes.has(indicator)

    return {
      provider: 'TorCheck', indicatorType: type, indicator,
      riskScore: isTor ? 60 : 0, confidence: 0.95,
      tags: isTor ? ['tor-exit-node', 'anonymization'] : ['not-tor'],
      relationships: [], rawData: { isTorExitNode: isTor }, timestamp: Date.now(),
    }
  }
}
