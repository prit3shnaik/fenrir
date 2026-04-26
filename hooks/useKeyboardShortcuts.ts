import { useEffect } from 'react'
import { useStore } from '@/store/useStore'

interface Options {
  onSearch: () => void
  onEnrich: () => void
  onExport: () => void
  onSettings: () => void
  onExtractor: () => void
  onRelayout: () => void
  onReset: () => void
  onTogglePanel: () => void
  onToggleTheme: () => void
}

export function useKeyboardShortcuts(opts: Options) {
  const { selectedNodeId, selectNode, toggleTheme, applyCurrentLayout } = useStore()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if typing in input/textarea
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        // Allow Escape to blur inputs
        if (e.key === 'Escape') (e.target as HTMLElement).blur()
        return
      }

      switch (e.key) {
        case '/':
          e.preventDefault()
          opts.onSearch()
          break

        case 'e':
        case 'E':
          if (selectedNodeId) {
            e.preventDefault()
            opts.onEnrich()
          }
          break

        case 'Escape':
          selectNode(null)
          break

        case 'r':
        case 'R':
          e.preventDefault()
          applyCurrentLayout()
          opts.onRelayout()
          break

        case 't':
        case 'T':
          e.preventDefault()
          toggleTheme()
          opts.onToggleTheme()
          break

        case 'p':
        case 'P':
          e.preventDefault()
          opts.onTogglePanel()
          break

        case 'x':
        case 'X':
          if (e.shiftKey) {
            e.preventDefault()
            opts.onExport()
          }
          break

        case 'i':
        case 'I':
          e.preventDefault()
          opts.onExtractor()
          break

        case ',':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            opts.onSettings()
          }
          break

        case 'Delete':
        case 'Backspace':
          if (selectedNodeId && e.shiftKey) {
            e.preventDefault()
            const { nodes, edges, loadGraph } = useStore.getState()
            const newNodes = nodes.filter(n => n.id !== selectedNodeId)
            const newEdges = edges.filter(ed => ed.source !== selectedNodeId && ed.target !== selectedNodeId)
            loadGraph(newNodes, newEdges)
            selectNode(null)
          }
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedNodeId, selectNode, toggleTheme, applyCurrentLayout, opts])
}