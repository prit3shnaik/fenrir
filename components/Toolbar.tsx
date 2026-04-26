'use client'
import { useStore } from '@/store/useStore'
import type { GraphMode, LayoutType } from '@/types'
import {
  Network, Shield, Target, LayoutDashboard,
  Settings, Download, RotateCcw, Save,
  Upload, Scan, Keyboard, HelpCircle
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import clsx from 'clsx'

interface Props {
  onOpenSettings:  () => void
  onOpenExport:    () => void
  onOpenBulk:      () => void
  onOpenExtractor: () => void
  onOpenShortcuts: () => void
  onRestartTour:   () => void
  onSave:          () => void
}

const MODES: { id: GraphMode; label: string; Icon: React.ElementType }[] = [
  { id: 'infrastructure', label: 'Infra',    Icon: Network },
  { id: 'reputation',    label: 'Repute',   Icon: Shield  },
  { id: 'campaign',      label: 'Campaign', Icon: Target  },
]

const LAYOUTS: { id: LayoutType; label: string }[] = [
  { id: 'dagre',  label: 'Dagre'  },
  { id: 'radial', label: 'Radial' },
  { id: 'force',  label: 'Force'  },
]

export default function Toolbar(props: Props) {
  const { graphMode, layout, setGraphMode, setLayout, applyCurrentLayout, resetGraph, nodes } = useStore()

  const handleLayout = (l: LayoutType) => {
    setLayout(l)
    setTimeout(() => applyCurrentLayout(), 10)
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 border-t border-border bg-surface flex-wrap flex-shrink-0">
      {/* Graph modes */}
      <div className="flex gap-1">
        {MODES.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setGraphMode(id)}
            className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all',
              graphMode === id ? 'bg-accent text-white' : 'text-muted hover:text-text hover:bg-border'
            )}>
            <Icon size={10} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-border hidden sm:block" />

      {/* Layouts */}
      <div className="hidden sm:flex gap-1">
        {LAYOUTS.map(({ id, label }) => (
          <button key={id} onClick={() => handleLayout(id)}
            className={clsx('px-2 py-1 rounded text-xs transition-all',
              layout === id ? 'text-accent' : 'text-muted hover:text-text')}>
            {label}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-border hidden sm:block" />
      <span className="text-xs text-muted font-mono hidden sm:block">{nodes.length} nodes</span>

      {/* Actions */}
      <div className="flex gap-1 ml-auto items-center">
        <ThemeToggle />
        <div className="w-px h-4 bg-border" />
        <button onClick={props.onOpenExtractor} title="IOC Extractor (I)"
          className="p-1.5 rounded text-muted hover:text-accent hover:bg-border transition-all">
          <Scan size={14} />
        </button>
        <button onClick={props.onOpenBulk} title="Bulk Import"
          className="p-1.5 rounded text-muted hover:text-accent hover:bg-border transition-all">
          <Upload size={14} />
        </button>
        <button onClick={props.onSave} title="Save Case"
          className="p-1.5 rounded text-muted hover:text-safe hover:bg-border transition-all">
          <Save size={14} />
        </button>
        <button onClick={props.onOpenExport} title="Export (Shift+X)"
          className="p-1.5 rounded text-muted hover:text-accent hover:bg-border transition-all">
          <Download size={14} />
        </button>
        <button onClick={() => applyCurrentLayout()} title="Re-layout (R)"
          className="p-1.5 rounded text-muted hover:text-text hover:bg-border transition-all">
          <LayoutDashboard size={14} />
        </button>
        <button onClick={props.onOpenSettings} title="Settings (Ctrl+,)"
          className="p-1.5 rounded text-muted hover:text-text hover:bg-border transition-all">
          <Settings size={14} />
        </button>
        <button onClick={props.onOpenShortcuts} title="Shortcuts (?)"
          className="p-1.5 rounded text-muted hover:text-text hover:bg-border transition-all">
          <Keyboard size={14} />
        </button>
        <button onClick={props.onRestartTour} title="Help tour"
          className="p-1.5 rounded text-muted hover:text-accent hover:bg-border transition-all">
          <HelpCircle size={14} />
        </button>
        <div className="w-px h-4 bg-border" />
        <button onClick={resetGraph} title="Reset Graph"
          className="p-1.5 rounded text-muted hover:text-danger hover:bg-border transition-all">
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  )
}