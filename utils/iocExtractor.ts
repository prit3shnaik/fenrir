import type { IndicatorType } from '@/types'

export interface ExtractedIOC {
  value: string
  type: IndicatorType
  raw: string
}

// Refang before extracting
function refang(text: string): string {
  return text
    .replace(/\[\.\]/g, '.')
    .replace(/\[dot\]/gi, '.')
    .replace(/\(dot\)/gi, '.')
    .replace(/\{dot\}/gi, '.')
    .replace(/hxxps?/gi, m => m.replace('xx', 'tt'))
    .replace(/h__ps?/gi, m => m.replace('__', 'ttp'))
    .replace(/\[:\/\/\]/g, '://')
    .replace(/\[\/\/\]/g, '//')
}

const PATTERNS = {
  // MD5, SHA1, SHA256
  hash: /\b([a-f0-9]{64}|[a-f0-9]{40}|[a-f0-9]{32})\b/gi,

  // URLs — must come before domain
  url: /\b(https?:\/\/[^\s<>"'\])\},;]+)/gi,

  // IPv4
  ip: /\b((?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))\b/g,

  // Domains — loose but filters noise
  domain: /\b((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|io|xyz|ru|cn|de|uk|info|biz|co|app|dev|sh|me|tk|ml|ga|cf|gov|edu|mil|int|arpa|onion|to|cc|tv|us|ca|au|fr|jp|br|in|nl|pl|se|no|fi|dk|be|ch|at|nz|za|mx|sg|hk|tw|kr|il|sa|ae|tr|ph|th|id|vn|my|pk|bd|ng|ke|gh|tz|eg|ma|dz|tn|ly|sd|et|ug|cm|ci|sn|gn|ml|bf|ne|tg|bj|mz|zm|zw|rw|bi|cd|cg|cf|ga|ao|na|bw|ls|sz|mg|mw|mu|sc|km|dj|er|so|ss|lr|sl|gm|gw|cv|st|gq|mr|eh|re|yt|pm|bl|mf|gp|mq|aw|cw|bq|sx|tc|ky|vg|vi|ms|ai|ag|bb|dm|gd|ht|jm|kn|lc|vc|tt|bs|bm|gl|fo|is|je|gg|im|ax|va|sm|mc|li|ad|mt|cy|lu|lv|lt|ee|by|md|ua|am|ge|az|kg|kz|tj|tm|uz|mn|kp|la|kh|mm|np|bt|mv|lk|af|iq|ir|sy|lb|jo|ps|ye|om|bh|kw|qa|ge|az|al|mk|rs|me|ba|hr|si|sk|cz|hu|ro|bg|gr|tr))\b/gi,
}

// Private / reserved IPs to skip
const PRIVATE_IP = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.|255\.|169\.254\.)/

// Common words that match domain pattern but aren't IOCs
const DOMAIN_BLOCKLIST = new Set([
  'example.com', 'test.com', 'localhost.com', 'domain.com',
  'email.com', 'user.com', 'name.com', 'host.com',
])

export function extractIOCs(text: string): ExtractedIOC[] {
  const refanged = refang(text)
  const found = new Map<string, ExtractedIOC>()

  // Extract hashes first
  const hashMatches = refanged.matchAll(PATTERNS.hash)
  for (const m of hashMatches) {
    const val = m[1].toLowerCase()
    if (!found.has(val)) {
      found.set(val, { value: val, type: 'hash', raw: m[0] })
    }
  }

  // Extract URLs
  const urlMatches = refanged.matchAll(PATTERNS.url)
  for (const m of urlMatches) {
    const val = m[1].replace(/[.,;)}\]]+$/, '') // strip trailing punctuation
    if (!found.has(val)) {
      found.set(val, { value: val, type: 'url', raw: m[0] })
    }
  }

  // Extract IPs (skip private/reserved)
  const ipMatches = refanged.matchAll(PATTERNS.ip)
  for (const m of ipMatches) {
    const val = m[1]
    if (!PRIVATE_IP.test(val) && !found.has(val)) {
      found.set(val, { value: val, type: 'ip', raw: m[0] })
    }
  }

  // Extract domains (skip if already captured as URL host or IP)
  const domainMatches = refanged.matchAll(PATTERNS.domain)
  for (const m of domainMatches) {
    const val = m[0].toLowerCase()
    if (!found.has(val) && !DOMAIN_BLOCKLIST.has(val)) {
      // Skip if it's the hostname of an already-found URL
      const alreadyInUrl = [...found.values()].some(
        ioc => ioc.type === 'url' && ioc.value.includes(val)
      )
      if (!alreadyInUrl) {
        found.set(val, { value: val, type: 'domain', raw: m[0] })
      }
    }
  }

  return [...found.values()]
}

export function highlightIOCs(text: string, iocs: ExtractedIOC[]): string {
  let result = text
  const TYPE_COLORS: Record<IndicatorType, string> = {
    ip:     '#3b82f6',
    domain: '#8b5cf6',
    url:    '#f59e0b',
    hash:   '#10b981',
  }
  // Sort by length desc to avoid partial replacements
  const sorted = [...iocs].sort((a, b) => b.raw.length - a.raw.length)
  sorted.forEach(ioc => {
    const escaped = ioc.raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(
      new RegExp(escaped, 'g'),
      `<mark style="background:${TYPE_COLORS[ioc.type]}22;color:${TYPE_COLORS[ioc.type]};border-radius:3px;padding:0 2px">${ioc.raw}</mark>`
    )
  })
  return result
}