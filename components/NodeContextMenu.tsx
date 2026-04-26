'use client'
import { useEffect, useRef } from 'react'
import {
  RefreshCw, Copy, Share2, Trash2,
  StickyNote, ExternalLink, Shield, Crosshair
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { defangIndicator } from '@/utils/defang'
import clsx from 'clsx'

interface Props {
  nodeId: string
  x: number
  y: number
  onClose: () => void
  onEnrich: (nodeId: string, label: string) => void
  onPivot: (nodeId: string, label: string) => void
  onFocusNote: () => void
}

export default function NodeContextMenu({
  nodeId, x, y, onClose, onEnrich, onPivot, onFocusNote
}: Props) {
  const { nodes, edges, selectNode } = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const node = nodes.find(n => n.id === nodeId)

  // Remove node from graph
  const removeNode = () => {
    const { loadGraph } = useStore.getState()
    const newNodes = nodes.filter(n => n.id !== nodeId)
    const newEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId)
    loadGraph(newNodes, newEdges)
    onClose()
  }

  // Close on outside click or escape
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  // Adjust position so menu doesn't overflow viewport
  const menuW = 200
  const menuH = 280
  const adjX = x + menuW > window.innerWidth ? x - menuW : x
  const adjY = y + menuH > window.innerHeight ? y - menuH : y

  if (!node) return null

  const ITEMS = [
    {
      icon: RefreshCw, label: 'Enrich', shortcut: 'E',
      onClick: () => { onEnrich(nodeId, node.label); onClose() },
      color: 'text-accent',
    },
    {
      icon: Crosshair, label: 'Pivot & Expand', shortcut: 'P',
      onClick: () => { onPivot(nodeId, node.label); onClose() },
      color: 'text-safe',
    },
    null, // divider
    {
      icon: Copy, label: 'Copy IOC', shortcut: 'C',
      onClick: () => { navigator.clipboard.writeText(node.label); onClose() },
      color: 'text-muted',
    },
    {
      icon: Shield, label: 'Copy Defanged', shortcut: null,
      onClick: () => { navigator.clipboard.writeText(defangIndicator(node.label)); onClose() },
      color: 'text-muted',
    },
    {
      icon: ExternalLink, label: 'Open in VT', shortcut: null,
      onClick: () => {
        const url = `https://www.virustotal.com/gui/search/${encodeURIComponent(node.label)}`
        window.open(url, '_blank')
        onClose()
      },
      color: 'text-muted',
    },
    null, // divider
    {
      icon: StickyNote, label: 'Add Note', shortcut: 'N',
      onClick: () => {
        selectNode(nodeId)
        onFocusNote()
        onClose()
      },
      color: 'text-muted',
    },
    null, // divider
    {
      icon: Trash2, label: 'Remove Node', shortcut: 'Del',
      onClick: removeNode,
      color: 'text-danger',
    },
  ]

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-surface border border-border rounded-xl shadow-glow py-1 min-w-[200px]"
      style={{ left: adjX, top: adjY }}
    >
      {/* Node label header */}
      <div className="px-3 py-2 border-b border-border mb-1">
        <div className="text-[9px] text-muted uppercase tracking-wide">{node.type}</div>
        <div className="text-xs font-mono text-text truncate max-w-[180px]">{node.label}</div>
      </div>

      {ITEMS.map((item, i) => {
        if (item === null) return <div key={`sep-${i}`} className="my-1 border-t border-border" />
        const { icon: Icon, label, shortcut, onClick, color } = item
        return (
          <button
            key={label}
            onClick={onClick}
            className={clsx(
              'flex items-center gap-2.5 w-full px-3 py-2 text-left text-xs hover:bg-border transition-colors',
              color
            )}
          >
            <Icon size={13} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {shortcut && (
              <kbd className="text-[9px] text-muted bg-border px-1.5 py-0.5 rounded font-mono">{shortcut}</kbd>
            )}
          </button>
        )
      })}
    </div>
  )
}