'use client'
import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import SearchBar from '@/components/SearchBar'
import IntelPanel from '@/components/IntelPanel'
import Toolbar from '@/components/Toolbar'
import SettingsModal from '@/components/SettingsModal'
import ExportModal from '@/components/ExportModal'
import { useInvestigation } from '@/hooks/useInvestigation'
import { useEnrichment } from '@/hooks/useEnrichment'
import { useStore } from '@/store/useStore'
import { loadApiKeys } from '@/utils/db'
import { saveCase } from '@/utils/db'
import { caseToSaved } from '@/utils/exportUtils'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'

// Dynamic import for ReactFlow (client-only)
const GraphCanvas = dynamic(() => import('@/components/GraphCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-bg">
      <div className="text-accent text-sm animate-pulse font-mono">Loading graph engine...</div>
    </div>
  ),
})

const queryClient = new QueryClient()

function FenrirApp() {
  const [settings, setSettings] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true)
  const { investigate, pivotNode } = useInvestigation()
  const { enrich } = useEnrichment()
  const { nodes, edges, setApiKeys } = useStore()

  // Load API keys on mount
  useEffect(() => {
    loadApiKeys().then(k => setApiKeys(k))
  }, [setApiKeys])

  const handleSearch = (value: string) => {
    investigate(value)
  }

  const handleEnrich = (nodeId: string, label: string) => {
    enrich(nodeId, label)
  }

  const handleSave = async () => {
    const id = `case-${Date.now()}`
    const name = `Investigation ${new Date().toLocaleDateString()}`
    const saved = caseToSaved(id, name, nodes, edges)
    await saveCase(saved)
    // Simple feedback
    const el = document.createElement('div')
    el.innerText = '✓ Case saved'
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;z-index:9999;'
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 2000)
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bg">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface flex-shrink-0">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
            <span className="text-accent text-xs font-bold">⬡</span>
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-text leading-none">Fenrir</div>
            <div className="text-[10px] text-muted leading-none">0xprit3sh</div>
          </div>
        </div>
        <div className="flex-1">
          <SearchBar onSearch={handleSearch} />
        </div>
        <button
          onClick={() => setPanelOpen(p => !p)}
          className="text-muted hover:text-text p-1.5 rounded transition-colors flex-shrink-0"
        >
          {panelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        <GraphCanvas />
        {panelOpen && (
          <IntelPanel onEnrich={handleEnrich} onClose={() => setPanelOpen(false)} />
        )}
      </div>

      {/* Toolbar */}
      <Toolbar
        onOpenSettings={() => setSettings(true)}
        onOpenExport={() => setExportOpen(true)}
        onSave={handleSave}
      />

      {/* Modals */}
      <SettingsModal open={settings} onClose={() => setSettings(false)} />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  )
}

export default function Page() {
  return (
    <QueryClientProvider client={queryClient}>
      <FenrirApp />
    </QueryClientProvider>
  )
}
