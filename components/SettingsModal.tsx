'use client'
import { useState, useEffect } from 'react'
import { X, Key, Save, Eye, EyeOff } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { saveApiKeys, loadApiKeys } from '@/utils/db'
import type { ApiKeys } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
}

const KEYS: { id: keyof ApiKeys; label: string; url: string; required: boolean }[] = [
  { id: 'virustotal', label: 'VirusTotal', url: 'https://www.virustotal.com/gui/my-apikey', required: true },
  { id: 'urlscan', label: 'URLScan.io', url: 'https://urlscan.io/user/profile/', required: false },
  { id: 'abuseipdb', label: 'AbuseIPDB', url: 'https://www.abuseipdb.com/account/api', required: false },
  { id: 'otx', label: 'AlienVault OTX', url: 'https://otx.alienvault.com/settings', required: false },
  { id: 'triage', label: 'Hatching Triage', url: 'https://tria.ge/user', required: false },
  { id: 'shodan', label: 'Shodan', url: 'https://account.shodan.io/', required: false },
  { id: 'greynoise', label: 'GreyNoise', url: 'https://viz.greynoise.io/account/api-key', required: false },
  { id: 'claude', label: 'Claude AI (for summaries)', url: 'https://console.anthropic.com/', required: false },
]

export default function SettingsModal({ open, onClose }: Props) {
  const { apiKeys, setApiKeys } = useStore()
  const [draft, setDraft] = useState<Partial<ApiKeys>>({})
  const [show, setShow] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) {
      loadApiKeys().then(k => {
        setDraft(k)
        setApiKeys(k)
      })
    }
  }, [open, setApiKeys])

  const handleSave = async () => {
    setApiKeys(draft)
    await saveApiKeys(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-glow max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Key size={16} className="text-accent" />
            <span className="font-semibold text-sm">API Configuration</span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text"><X size={16} /></button>
        </div>

        <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
          <p className="text-xs text-muted">Keys stored locally in IndexedDB. Never sent to any server.</p>
          <p className="text-xs text-muted/60">No-key providers (WHOIS, BGPView, crt.sh, TorCheck, MalwareBazaar) run automatically.</p>

          {KEYS.map(({ id, label, url, required }) => (
            <div key={id}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-textDim flex items-center gap-1">
                  {label}
                  {required && <span className="text-accent text-[10px]">*</span>}
                </label>
                <a href={url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline">Get key ↗</a>
              </div>
              <div className="flex gap-2">
                <input
                  type={show[id] ? 'text' : 'password'}
                  value={draft[id] ?? ''}
                  onChange={e => setDraft(d => ({ ...d, [id]: e.target.value }))}
                  placeholder={`${label} API key`}
                  className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-xs font-mono text-text outline-none focus:border-accent"
                />
                <button
                  onClick={() => setShow(s => ({ ...s, [id]: !s[id] }))}
                  className="p-2 rounded-lg border border-border text-muted hover:text-text"
                >
                  {show[id] ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-muted hover:text-text">Cancel</button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg text-sm font-medium"
          >
            <Save size={13} />
            {saved ? 'Saved!' : 'Save Keys'}
          </button>
        </div>
      </div>
    </div>
  )
}
