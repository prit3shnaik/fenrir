'use client'
import { useState, useEffect, useCallback } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import SearchBar from '@/components/SearchBar'
import IntelPanel from '@/components/IntelPanel'
import Toolbar from '@/components/Toolbar'
import SettingsModal from '@/components/SettingsModal'
import ExportModal from '@/components/ExportModal'
import BulkImportModal from '@/components/BulkImportModal'
import { useInvestigation } from '@/hooks/useInvestigation'
import { useEnrichment } from '@/hooks/useEnrichment'
import { useStore } from '@/store/useStore'
import { loadApiKeys, saveCase } from '@/utils/db'
import { caseToSaved } from '@/utils/exportUtils'
import { PanelRightClose, PanelRightOpen } from 'lucide-react'

const GraphCanvas = dynamic(() => import('@/components/GraphCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-bg">
      <div className="flex items-center gap-2 text-accent text-sm font-mono">
        <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        Loading graph engine...
      </div>
    </div>
  ),
})

const queryClient = new QueryClient()

function FenrirApp() {
  const [settings, setSettings]   = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [bulkOpen, setBulkOpen]   = useState(false)
  const [panelOpen, setPanelOpen] = useState(false) // closed by default on mobile
  const { investigate, newInvestigation } = useInvestigation()
  const { enrich } = useEnrichment()
  const { nodes, edges, setApiKeys, theme } = useStore()

  // Sync theme class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  useEffect(() => {
    loadApiKeys().then(k => setApiKeys(k))
  }, [setApiKeys])

  // Open panel automatically when a node is selected
  const { selectedNodeId } = useStore()
  useEffect(() => {
    if (selectedNodeId) setPanelOpen(true)
  }, [selectedNodeId])

  const handleBulkInvestigate = useCallback(async (indicators: string[]) => {
    for (const ind of indicators) {
      await investigate(ind)
      await new Promise(r => setTimeout(r, 400))
    }
  }, [investigate])

  const handleSave = async () => {
    const id = `case-${Date.now()}`
    await saveCase(caseToSaved(id, `Investigation ${new Date().toLocaleDateString()}`, nodes, edges))
    const el = document.createElement('div')
    el.innerText = '✓ Case saved'
    el.style.cssText = 'position:fixed;bottom:72px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;z-index:9999;pointer-events:none;font-family:monospace;'
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 2000)
  }

  return (
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden bg-bg">
      {/* Header */}
      <header className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-surface flex-shrink-0">
        {/* Logo — hidden on very small screens to save space */}
        <div className="flex items-center gap-2 flex-shrink-0 hidden xs:flex">
          <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
            <span className="text-accent text-xs font-bold">⬡</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-bold tracking-tight text-text leading-none">Fenrir</div>
            <div className="text-[10px] text-muted leading-none">0xprit3sh</div>
          </div>
        </div>

        {/* Search — takes all available space */}
        <div className="flex-1 min-w-0">
          <SearchBar onSearch={(v) => newInvestigation(v)} />
        </div>

        {/* Panel toggle */}
        <button
          onClick={() => setPanelOpen(p => !p)}
          className="text-muted hover:text-text p-1.5 rounded-lg hover:bg-border transition-colors flex-shrink-0"
          title={panelOpen ? 'Hide panel' : 'Show panel'}
        >
          {panelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>
      </header>

      {/* Main canvas + panel */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <GraphCanvas />

        {/* Intel panel — full screen on mobile, sidebar on desktop */}
        {panelOpen && (
          <div className="
            absolute inset-0 z-30 sm:relative sm:inset-auto
            sm:w-72 sm:flex-shrink-0
            flex flex-col
          ">
            <IntelPanel
              onEnrich={(nodeId, label) => enrich(nodeId, label)}
              onClose={() => setPanelOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Toolbar */}
      <Toolbar
        onOpenSettings={() => setSettings(true)}
        onOpenExport={() => setExportOpen(true)}
        onOpenBulk={() => setBulkOpen(true)}
        onSave={handleSave}
      />

      <SettingsModal open={settings} onClose={() => setSettings(false)} />
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} />
      <BulkImportModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onInvestigate={handleBulkInvestigate}
      />
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
