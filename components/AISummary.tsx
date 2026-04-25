'use client'
import { useState } from 'react'
import { Sparkles, X, Copy, Loader } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function AISummary() {
  const { nodes, edges, enrichmentResults } = useStore()
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const buildPrompt = () => {
    const nodesSummary = nodes.map(n => ({
      label: n.label,
      type: n.type,
      riskScore: n.riskScore,
      riskLevel: n.riskLevel,
      tags: (enrichmentResults[n.id] ?? []).flatMap(r => r.tags).slice(0, 5),
    }))

    const edgesSummary = edges.map(e => ({
      from: nodes.find(n => n.id === e.source)?.label,
      relationship: e.type,
      to: nodes.find(n => n.id === e.target)?.label,
    }))

    return `You are a threat intelligence analyst. Analyze this investigation graph and provide a concise summary.

NODES:
${JSON.stringify(nodesSummary, null, 2)}

RELATIONSHIPS:
${JSON.stringify(edgesSummary, null, 2)}

Provide:
1. What this infrastructure likely represents
2. Threat level assessment
3. Key indicators of compromise
4. Recommended actions
5. Possible threat actor or campaign

Be concise, technical, and actionable. Under 300 words.`
  }

  const generate = async () => {
    if (nodes.length === 0) return
    setLoading(true)
    setError('')
    setSummary('')

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '',  // user must provide via env or settings
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: buildPrompt() }],
        }),
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json() as { content: { type: string; text: string }[] }
      const text = data.content.find(c => c.type === 'text')?.text ?? ''
      setSummary(text)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wide">
          <Sparkles size={10} className="text-accent" /> AI Summary
        </div>
        <button
          onClick={generate}
          disabled={loading || nodes.length === 0}
          className="flex items-center gap-1 px-3 py-1 bg-accent hover:bg-accentHover text-white rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader size={11} className="animate-spin" /> : <Sparkles size={11} />}
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {error && (
        <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg p-2">
          {error}
          {error.includes('401') && ' — Add Claude API key in Settings'}
        </div>
      )}

      {summary && (
        <div className="relative">
          <div className="text-xs text-textDim leading-relaxed whitespace-pre-wrap bg-bg border border-border rounded-lg p-3 max-h-64 overflow-y-auto">
            {summary}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(summary)}
            className="absolute top-2 right-2 p-1 text-muted hover:text-text"
          >
            <Copy size={11} />
          </button>
        </div>
      )}

      {!summary && !loading && !error && (
        <div className="text-xs text-muted text-center py-4">
          {nodes.length === 0 ? 'Add nodes to the graph first' : 'Click Analyze to generate AI threat summary'}
        </div>
      )}
    </div>
  )
}
