'use client'
import { useState } from 'react'
import { Sparkles, Copy, Loader, ExternalLink, RefreshCw } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function AISummary() {
  const { nodes, edges, enrichmentResults, apiKeys } = useStore()
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usedProvider, setUsedProvider] = useState('')

  const buildPrompt = () => {
    const nodesSummary = nodes.map(n => ({
      label: n.label,
      type: n.type,
      riskScore: n.riskScore,
      riskLevel: n.riskLevel,
      tags: (enrichmentResults[n.id] ?? []).flatMap((r: { tags: string[] }) => r.tags).slice(0, 5),
    }))
    const edgesSummary = edges.map(e => ({
      from: nodes.find(n => n.id === e.source)?.label,
      relationship: e.type,
      to: nodes.find(n => n.id === e.target)?.label,
    }))
    return `You are a threat intelligence analyst. Analyze this investigation graph concisely in under 250 words.

NODES: ${JSON.stringify(nodesSummary)}
RELATIONSHIPS: ${JSON.stringify(edgesSummary)}

Provide:
1. What this infrastructure represents
2. Threat level assessment
3. Key IOCs
4. Recommended actions
5. Possible threat actor/campaign

Be technical and actionable.`
  }

  const tryGemini = async (apiKey: string, prompt: string): Promise<string> => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 600, temperature: 0.3 },
        }),
      }
    )

    if (res.status === 429) throw new Error('RATE_LIMIT')
    if (res.status === 400) throw new Error('INVALID_KEY')
    if (!res.ok) throw new Error(`Gemini error ${res.status}`)

    const data = await res.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response'
  }

  const tryGroq = async (apiKey: string, prompt: string): Promise<string> => {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.3,
      }),
    })

    if (res.status === 429) throw new Error('RATE_LIMIT')
    if (res.status === 401) throw new Error('INVALID_KEY')
    if (!res.ok) throw new Error(`Groq error ${res.status}`)

    const data = await res.json() as {
      choices?: { message?: { content?: string } }[]
    }
    return data.choices?.[0]?.message?.content ?? 'No response'
  }

  const generate = async () => {
    if (nodes.length === 0) return
    setLoading(true)
    setError('')
    setSummary('')
    setUsedProvider('')

    const geminiKey = apiKeys['gemini'] ?? ''
    const groqKey   = apiKeys['groq']   ?? ''
    const prompt    = buildPrompt()

    try {
      // Try Gemini first
      if (geminiKey) {
        try {
          const text = await tryGemini(geminiKey, prompt)
          setSummary(text)
          setUsedProvider('Gemini 2.0 Flash')
          return
        } catch (e) {
          const msg = e instanceof Error ? e.message : ''
          if (msg === 'RATE_LIMIT') {
            setError('Gemini rate limit hit — trying Groq...')
            await new Promise(r => setTimeout(r, 500))
          } else if (msg === 'INVALID_KEY') {
            setError('Gemini key invalid — trying Groq...')
          } else {
            setError(`Gemini failed (${msg}) — trying Groq...`)
          }
        }
      }

      // Fallback to Groq
      if (groqKey) {
        try {
          const text = await tryGroq(groqKey, prompt)
          setSummary(text)
          setUsedProvider('Groq Llama 3.3 70B')
          setError('')
          return
        } catch (e) {
          const msg = e instanceof Error ? e.message : ''
          if (msg === 'RATE_LIMIT') throw new Error('Both providers rate limited. Wait 1 minute and retry.')
          if (msg === 'INVALID_KEY') throw new Error('Groq API key is invalid.')
          throw new Error(`Groq failed: ${msg}`)
        }
      }

      if (!geminiKey && !groqKey) {
        throw new Error('Add a Gemini or Groq API key in Settings to use AI analysis.')
      }

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-3 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wide">
          <Sparkles size={10} className="text-accent" /> AI Summary
          {usedProvider && (
            <span className="text-[9px] text-safe bg-safe/10 px-1.5 py-0.5 rounded-full normal-case tracking-normal">
              via {usedProvider}
            </span>
          )}
        </div>
        <button
          onClick={generate}
          disabled={loading || nodes.length === 0}
          className="flex items-center gap-1 px-3 py-1 bg-accent hover:bg-accentHover text-white rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader size={11} className="animate-spin" /> : <Sparkles size={11} />}
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {/* Free API info */}
      <div className="bg-safe/10 border border-safe/20 rounded-xl p-2.5">
        <div className="text-[10px] text-safe font-semibold mb-1.5">Free AI APIs — no credit card</div>
        <div className="flex flex-col gap-1">
          {[
            { label: 'Google Gemini 2.0 Flash', sub: '1,500 req/day', url: 'https://aistudio.google.com/apikey', key: 'gemini' },
            { label: 'Groq Llama 3.3 70B',      sub: '14,000 req/day', url: 'https://console.groq.com/keys',   key: 'groq'   },
          ].map(p => {
            const hasKey = !!(apiKeys[p.key])
            return (
              <div key={p.key} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${hasKey ? 'bg-safe' : 'bg-border'}`} />
                  <span className="text-[10px] text-textDim">{p.label}</span>
                  <span className="text-[9px] text-muted">{p.sub}</span>
                </div>
                {!hasKey && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] text-accent flex items-center gap-0.5 hover:underline">
                    Get key <ExternalLink size={8} />
                  </a>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-xl p-3 flex items-start gap-2">
          <span className="flex-1">{error}</span>
          {error.includes('rate limit') && (
            <button onClick={generate} className="flex-shrink-0 text-accent hover:text-accentHover">
              <RefreshCw size={12} />
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="relative">
          <div className="text-xs text-textDim leading-relaxed whitespace-pre-wrap bg-bg border border-border rounded-xl p-3 max-h-72 overflow-y-auto">
            {summary}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(summary)}
            className="absolute top-2 right-2 p-1 text-muted hover:text-text bg-surface rounded-lg border border-border"
          >
            <Copy size={11} />
          </button>
        </div>
      )}

      {!summary && !loading && !error && (
        <div className="text-xs text-muted text-center py-6">
          {nodes.length === 0
            ? 'Add nodes to the graph first'
            : 'Click Analyze to generate AI threat summary'}
        </div>
      )}
    </div>
  )
}