import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOSTS = [
  'www.virustotal.com',
  'urlscan.io',
  'api.abuseipdb.com',
  'otx.alienvault.com',
  'tria.ge',
  'api.shodan.io',
  'api.greynoise.io',
  'mb-api.abuse.ch',
  'rdap.org',
  'api.bgpview.io',
  'crt.sh',
  'check.torproject.org',
  'api.webcheck.pro',
  'ip-api.com',
  'urlhaus-api.abuse.ch',
  'checkurl.phishtank.com',
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      url: string
      method?: string
      headers?: Record<string, string>
      body?: string
    }

    const { url, method = 'GET', headers = {}, body: reqBody } = body
    const target = new URL(url)

    if (!ALLOWED_HOSTS.includes(target.hostname)) {
      return NextResponse.json({ error: `Host not allowed: ${target.hostname}` }, { status: 403 })
    }

    const res = await fetch(url, {
      method,
      headers: { 'User-Agent': 'Fenrir-ThreatIntel/1.0', ...headers },
      body: reqBody ?? undefined,
    })

    const contentType = res.headers.get('content-type') ?? ''
    let data: unknown

    if (contentType.includes('application/json')) {
      data = await res.json()
    } else {
      data = await res.text()
    }

    return NextResponse.json({ data, status: res.status })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Proxy error' },
      { status: 500 }
    )
  }
}