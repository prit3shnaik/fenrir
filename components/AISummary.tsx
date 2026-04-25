'use client'
import { useState } from 'react'
import { Sparkles, Copy, Loader, ExternalLink } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function AISummary() {
  const { nodes, edges, enrichmentResults, apiKeys } = useStore()
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
    return `You are a threat intelligence analyst. Analyze this investigation graph concisely.

NODES: ${JSON.stringify(nodesSummary)}
RELATIONSHIPS: ${JSON.stringify(edgesSummary)}

Provide in under 250 words:
1. What this infrastructure represents
2. Threat level assessment  
3. Key IOCs
4. Recommended actions
5. Possible threat actor/campaign

Be technical and actionable.`
  }

  const generate = async () => {
    if (nodes.length === 0) return
    setLoading(true)
    setError('')
    setSummary('')

    const geminiKey = apiKeys['gemini'] ?? ''

    try {
      let text = ''

      if (geminiKey) {
        // Google Gemini (free, no credit card)
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: buildPrompt() }] }],
              generationConfig: { maxOutputTokens: 500, temperature: 0.3 },
            }),
          }
        )
        if (!res.ok) throw new Error(`Gemini error ${res.status}`)
        const data = await res.json() as {
          candidates?: { content?: { parts?: { text?: string }[] } }[]
        }
        text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response'
      } else {
        // Groq fallback (free, Llama 3)
        const groqKey = apiKeys['groq'] ?? ''
        if (!groqKey) throw new Error('Add a Gemini or Groq API key in Settings')

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: buildPrompt() }],
            max_tokens: 500,
            temperature: 0.3,
          }),
        })
        if (!res.ok) throw new Error(`Groq error ${res.status}`)
        const data = await res.json() as {
          choices?: { message?: { content?: string } }[]
        }
        text = data.choices?.[0]?.message?.content ?? 'No response'
      }

      setSummary(text)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 p-3 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted uppercase tracking-wide">
          <Sparkles size={10} className="text-accent" /> AI Summary
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
      <div className="bg-safe/10 border border-safe/20 rounded-lg p-2">
        <div className="text-[10px] text-safe font-medium mb-1">Free AI APIs supported</div>
        <div className="text-[10px] text-muted space-y-0.5">
          <div className="flex items-center justify-between">
            <span>Google Gemini 2.0 Flash</span>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
              className="text-accent flex items-center gap-0.5 hover:underline">
              Get key <ExternalLink size={8} />
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span>Groq (Llama 3.3 70B)</span>
            <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer"
              className="text-accent flex items-center gap-0.5 hover:underline">
              Get key <ExternalLink size={8} />
            </a>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-xs text-danger bg-danger/10 border border-danger/20 rounded-lg p-2">
          {error}
        </div>
      )}

      {summary && (
        <div className="relative">
          <div className="text-xs text-textDim leading-relaxed whitespace-pre-wrap bg-bg border border-border rounded-lg p-3 max-h-72 overflow-y-auto">
            {summary}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(summary)}
            className="absolute top-2 right-2 p-1 text-muted hover:text-text bg-surface rounded"
          >
            <Copy size={11} />
          </button>
        </div>
      )}

      {!summary && !loading && !error && (
        <div className="text-xs text-muted text-center py-4">
          {nodes.length === 0
            ? 'Add nodes to the graph first'
            : 'Add a Gemini or Groq key in Settings, then click Analyze'}
        </div>
      )}
    </div>
  )
          }
