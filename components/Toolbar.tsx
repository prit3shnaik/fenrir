'use client'
import { useStore } from '@/store/useStore'
import type { GraphMode, LayoutType } from '@/types'
import {
  Network, Shield, Target, LayoutDashboard,
  Settings, Download, RotateCcw, Save, Upload
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import clsx from 'clsx'

interface Props {
  onOpenSettings: () => void
  onOpenExport: () => void
  onOpenBulk: () => void
  onSave: () => void
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

export default function Toolbar({ onOpenSettings, onOpenExport, onOpenBulk, onSave }: Props) {
  const { graphMode, layout, setGraphMode, setLayout, applyCurrentLayout, resetGraph, nodes } = useStore()

  const handleLayout = (l: LayoutType) => {
    setLayout(l)
    setTimeout(() => applyCurrentLayout(), 10)
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t border-border bg-surface flex-wrap">
      {/* Graph modes */}
      <div className="flex gap-1">
        {MODES.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setGraphMode(id)}
            className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all',
              graphMode === id
                ? 'bg-accent text-white'
                : 'text-muted hover:text-text hover:bg-border'
            )}>
            <Icon size={11} />{label}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-border" />

      {/* Layouts */}
      <div className="flex gap-1">
        {LAYOUTS.map(({ id, label }) => (
          <button key={id} onClick={() => handleLayout(id)}
            className={clsx(
              'px-2 py-1 rounded text-xs transition-all',
              layout === id ? 'text-accent' : 'text-muted hover:text-text'
            )}>
            {label}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-border" />

      <span className="text-xs text-muted font-mono">{nodes.length} nodes</span>

      {/* Actions */}
      <div className="flex gap-1 ml-auto items-center">
        <ThemeToggle />
        <button onClick={onOpenBulk} title="Bulk Import"
          className="p-1.5 rounded text-muted hover:text-accent hover:bg-border transition-all">
          <Upload size={14} />
        </button>
        <button onClick={onSave} title="Save Case"
          className="p-1.5 rounded text-muted hover:text-safe hover:bg-border transition-all">
          <Save size={14} />
        </button>
        <button onClick={onOpenExport} title="Export"
          className="p-1.5 rounded text-muted hover:text-accent hover:bg-border transition-all">
          <Download size={14} />
        </button>
        <button onClick={() => applyCurrentLayout()} title="Re-layout"
          className="p-1.5 rounded text-muted hover:text-text hover:bg-border transition-all">
          <LayoutDashboard size={14} />
        </button>
        <button onClick={onOpenSettings} title="Settings"
          className="p-1.5 rounded text-muted hover:text-text hover:bg-border transition-all">
          <Settings size={14} />
        </button>
        <button onClick={resetGraph} title="Reset Graph"
          className="p-1.5 rounded text-muted hover:text-danger hover:bg-border transition-all">
          <RotateCcw size={14} />
        </button>
      </div>
    </div>
  )
}
