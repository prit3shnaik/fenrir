import type { ScannerProvider, IndicatorType, EnrichmentResult } from '@/types'
import { VirusTotalScanner } from './virustotal'
import { URLScanScanner } from './urlscan'
import { AbuseIPDBScanner } from './abuseipdb'
import { OTXScanner } from './otx'
import { TriageScanner } from './triage'
import { WebCheckScanner } from './webcheck'
import { ShodanScanner } from './shodan'
import { GreyNoiseScanner } from './greynoise'
import { MalwareBazaarScanner } from './malwarebazaar'
import { WhoisScanner } from './whois'
import { BGPViewScanner } from './bgpview'
import { CrtShScanner } from './crtsh'
import { TorCheckScanner } from './torcheck'
import { IPApiScanner } from './ipapi'
import { URLHausScanner } from './urlhaus'
import { PhishTankScanner } from './phishtank'

export const SCANNERS: ScannerProvider[] = [
  new VirusTotalScanner(),
  new URLScanScanner(),
  new AbuseIPDBScanner(),
  new OTXScanner(),
  new TriageScanner(),
  new WebCheckScanner(),
  new ShodanScanner(),
  new GreyNoiseScanner(),
  new MalwareBazaarScanner(),
  new WhoisScanner(),
  new BGPViewScanner(),
  new CrtShScanner(),
  new TorCheckScanner(),
  new IPApiScanner(),
  new URLHausScanner(),
  new PhishTankScanner(),
]

export function detectIndicatorType(value: string): IndicatorType {
  const v = value.trim()
  if (/^[a-f0-9]{32}$|^[a-f0-9]{40}$|^[a-f0-9]{64}$/i.test(v)) return 'hash'
  if (/^https?:\/\//i.test(v)) return 'url'
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(v)) return 'ip'
  return 'domain'
}

export async function enrichIndicator(
  indicator: string,
  type: IndicatorType,
  apiKeys: Record<string, string>
): Promise<EnrichmentResult[]> {
  const applicable = SCANNERS.filter(s => s.supportedTypes.includes(type))

  const results = await Promise.allSettled(
    applicable.map(s => {
      const key = apiKeys[s.name.toLowerCase().replace(/[\s.]/g, '')] ?? ''
      return s.scan(indicator, type, key)
    })
  )

  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    return {
      provider: applicable[i].name,
      indicatorType: type,
      indicator,
      riskScore: 0,
      confidence: 0,
      tags: [],
      relationships: [],
      rawData: {},
      error: r.reason instanceof Error ? r.reason.message : 'Unknown error',
      timestamp: Date.now(),
    }
  })
}