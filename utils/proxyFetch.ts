export async function proxyFetch(
  url: string,
  options: {
    method?: string
    headers?: Record<string, string>
    body?: string
  } = {}
): Promise<Response> {
  const res = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      method: options.method ?? 'GET',
      headers: options.headers ?? {},
      body: options.body,
    }),
  })

  if (!res.ok) throw new Error(`Proxy error ${res.status}`)

  const wrapper = await res.json() as { data: unknown; status: number }

  // Return a Response-like object
  return new Response(
    typeof wrapper.data === 'string' ? wrapper.data : JSON.stringify(wrapper.data),
    {
      status: wrapper.status,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
