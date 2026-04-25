'use client'
import { useState, useEffect } from 'react'
import { X, Key, Save, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { saveApiKeys, loadApiKeys } from '@/utils/db'
import type { ApiKeys } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
}

const KEY_GROUPS = [
  {
    label: 'Threat Intelligence',
    keys: [
      { id: 'virustotal', label: 'VirusTotal', url: 'https://www.virustotal.com/gui/my-apikey', required: true, free: '4 req/min' },
      { id: 'urlscan',    label: 'URLScan.io',  url: 'https://urlscan.io/user/profile/',        required: false, free: 'Free tier' },
      { id: 'abuseipdb',  label: 'AbuseIPDB',   url: 'https://www.abuseipdb.com/account/api',   required: false, free: '1k/day' },
      { id: 'otx',        label: 'AlienVault OTX', url: 'https://otx.alienvault.com/settings', required: false, free: 'Free' },
      { id: 'triage',     label: 'Hatching Triage', url: 'https://tria.ge/user',               required: false, free: 'Limited' },
      { id: 'shodan',     label: 'Shodan',       url: 'https://account.shodan.io/',              required: false, free: 'Freemium' },
      { id: 'greynoise',  label: 'GreyNoise',    url: 'https://viz.greynoise.io/account/api-key', required: false, free: 'Community' },
    ],
  },
  {
    label: 'AI Summary (100% Free)',
    keys: [
      { id: 'gemini', label: 'Google Gemini', url: 'https://aistudio.google.com/apikey', required: false, free: '1500/day free' },
      { id: 'groq',   label: 'Groq (Llama 3)', url: 'https://console.groq.com/keys',    required: false, free: '14k/day free' },
    ],
  },
]

export default function SettingsModal({ open, onClose }: Props) {
  const { setApiKeys } = useStore()
  const [draft, setDraft] = useState<Partial<ApiKeys>>({})
  const [show, setShow] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) loadApiKeys().then(k => { setDraft(k); setApiKeys(k) })
  }, [open, setApiKeys])

  const handleSave = async () => {
    setApiKeys(draft)
    await saveApiKeys(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-glow flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-accent" />
            <span className="font-semibold text-sm text-text">API Keys</span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1"><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
          <p className="text-xs text-muted">Stored in IndexedDB locally. Never leaves your browser.</p>
          <p className="text-xs text-muted/60">No-key providers run automatically: WHOIS · BGPView · crt.sh · TorCheck · MalwareBazaar</p>

          {KEY_GROUPS.map(group => (
            <div key={group.label}>
              <div className="text-[10px] text-accent uppercase tracking-widest mb-2 font-medium">{group.label}</div>
              <div className="flex flex-col gap-2">
                {group.keys.map(({ id, label, url, required, free }) => (
                  <div key={id} className="bg-bg rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-text">{label}</span>
                        {required && <span className="text-[9px] text-accent bg-accent/10 px-1 rounded">required</span>}
                        <span className="text-[9px] text-safe bg-safe/10 px-1 rounded">{free}</span>
                      </div>
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] text-accent flex items-center gap-0.5 hover:underline">
                        Get <ExternalLink size={8} />
                      </a>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type={show[id] ? 'text' : 'password'}
                        value={draft[id] ?? ''}
                        onChange={e => setDraft(d => ({ ...d, [id]: e.target.value }))}
                        placeholder={`${label} key`}
                        className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-xs font-mono text-text outline-none focus:border-accent min-w-0"
                      />
                      <button
                        onClick={() => setShow(s => ({ ...s, [id]: !s[id] }))}
                        className="p-2 rounded-lg border border-border text-muted hover:text-text flex-shrink-0"
                      >
                        {show[id] ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-text">Cancel</button>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-xl text-sm font-medium transition-colors">
            <Save size={13} />
            {saved ? 'Saved ✓' : 'Save Keys'}
          </button>
        </div>
      </div>
    </div>
  )
        }
