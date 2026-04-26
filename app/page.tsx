'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import dynamic from 'next/dynamic'
import SearchBar from '@/components/SearchBar'
import IntelPanel from '@/components/IntelPanel'
import Toolbar from '@/components/Toolbar'
import SettingsModal from '@/components/SettingsModal'
import ExportModal from '@/components/ExportModal'
import BulkImportModal from '@/components/BulkImportModal'
import IOCExtractor from '@/components/IOCExtractor'
import NodeContextMenu from '@/components/NodeContextMenu'
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal'
import OnboardingTour, { useTourState } from '@/components/OnboardingTour'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
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

interface ContextMenu {
  nodeId: string
  x: number
  y: number
}

function FenrirApp() {
  const [settings, setSettings]     = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [bulkOpen, setBulkOpen]     = useState(false)
  const [extractOpen, setExtractOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [panelOpen, setPanelOpen]   = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null)

  const searchRef = useRef<HTMLInputElement>(null)
  const noteRef   = useRef<HTMLTextAreaElement>(null)

  const { investigate, newInvestigation } = useInvestigation()
  const { enrich }  = useEnrichment()
  const { nodes, edges, selectedNodeId, setApiKeys, theme } = useStore()
  const tour = useTourState()

  // Theme sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark',  theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
  }, [theme])

  // Load keys
  useEffect(() => { loadApiKeys().then(k => setApiKeys(k)) }, [setApiKeys])

  // Auto-open panel on node select
  useEffect(() => { if (selectedNodeId) setPanelOpen(true) }, [selectedNodeId])

  // '?' opens shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === '?' && e.target === document.body) setShortcutsOpen(true)
      if (e.key === '?' && e.shiftKey) setShortcutsOpen(true)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  const handleBulkInvestigate = useCallback(async (indicators: string[]) => {
    for (const ind of indicators) {
      await investigate(ind)
      await new Promise(r => setTimeout(r, 350))
    }
  }, [investigate])

  const handleSave = async () => {
    await saveCase(caseToSaved(`case-${Date.now()}`, `Investigation ${new Date().toLocaleDateString()}`, nodes, edges))
    const el = document.createElement('div')
    el.innerText = '✓ Case saved'
    el.style.cssText = 'position:fixed;bottom:72px;left:50%;transform:translateX(-50%);background:#10b981;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;z-index:9999;pointer-events:none;'
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 2000)
  }

  // Context menu handler — exposed via window event from GraphCanvas
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as ContextMenu
      setContextMenu(detail)
    }
    window.addEventListener('fenrir:contextmenu', handler)
    return () => window.removeEventListener('fenrir:contextmenu', handler)
  }, [])

  useKeyboardShortcuts({
    onSearch:      () => { const el = document.querySelector('input[placeholder]') as HTMLInputElement; el?.focus() },
    onEnrich:      () => { if (selectedNodeId) { const n = nodes.find(n => n.id === selectedNodeId); if (n) enrich(n.id, n.label) } },
    onExport:      () => setExportOpen(true),
    onSettings:    () => setSettings(true),
    onExtractor:   () => setExtractOpen(true),
    onRelayout:    () => {},
    onReset:       () => {},
    onTogglePanel: () => setPanelOpen(p => !p),
    onToggleTheme: () => {},
  })

  return (
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden bg-bg">
      {/* Onboarding */}
      {tour.show && <OnboardingTour onComplete={tour.complete} />}

      {/* Header */}
      <header className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-surface flex-shrink-0">
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
            <span className="text-accent text-xs font-bold">⬡</span>
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-text leading-none">Fenrir</div>
            <div className="text-[10px] text-muted leading-none">0xprit3sh</div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <SearchBar onSearch={(v) => newInvestigation(v)} />
        </div>

        <button
          onClick={() => setPanelOpen(p => !p)}
          className="text-muted hover:text-text p-1.5 rounded-lg hover:bg-border transition-colors flex-shrink-0"
        >
          {panelOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
        </button>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden min-h-0 relative">
        <GraphCanvas />
        {panelOpen && (
          <div className="absolute inset-0 z-30 sm:relative sm:inset-auto sm:w-72 sm:flex-shrink-0 flex flex-col">
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
        onOpenExtractor={() => setExtractOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onRestartTour={tour.restart}
        onSave={handleSave}
      />

      {/* Context menu */}
      {contextMenu && (
        <NodeContextMenu
          nodeId={contextMenu.nodeId}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onEnrich={(id, label) => { enrich(id, label); setContextMenu(null) }}
          onPivot={(id, label) => { enrich(id, label); setContextMenu(null) }}
          onFocusNote={() => {
            setPanelOpen(true)
            setTimeout(() => noteRef.current?.focus(), 200)
          }}
        />
      )}

      {/* Modals */}
      <SettingsModal    open={settings}     onClose={() => setSettings(false)}     />
      <ExportModal      open={exportOpen}   onClose={() => setExportOpen(false)}   />
      <BulkImportModal  open={bulkOpen}     onClose={() => setBulkOpen(false)}     onInvestigate={handleBulkInvestigate} />
      <IOCExtractor     open={extractOpen}  onClose={() => setExtractOpen(false)}  onInvestigate={handleBulkInvestigate} />
      <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
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