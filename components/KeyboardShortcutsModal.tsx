'use client'
import { X, Keyboard } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
}

const SHORTCUTS = [
  { group: 'Navigation' },
  { key: '/',          desc: 'Focus search bar'         },
  { key: 'Esc',        desc: 'Deselect node / close'   },
  { key: 'P',          desc: 'Toggle intel panel'       },
  { key: 'T',          desc: 'Toggle dark / light mode' },
  { group: 'Graph' },
  { key: 'E',          desc: 'Enrich selected node'     },
  { key: 'R',          desc: 'Re-layout graph'          },
  { key: 'Shift+Del',  desc: 'Remove selected node'     },
  { group: 'Tools' },
  { key: 'I',          desc: 'Open IOC extractor'       },
  { key: 'Shift+X',    desc: 'Open export modal'        },
  { key: 'Ctrl+,',     desc: 'Open settings'            },
  { group: 'Tour' },
  { key: '?',          desc: 'Restart onboarding tour'  },
]

export default function KeyboardShortcutsModal({ open, onClose }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm shadow-glow max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Keyboard size={16} className="text-accent" />
            <span className="font-semibold text-sm text-text">Keyboard Shortcuts</span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-text p-1"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto p-4 flex flex-col gap-1">
          {SHORTCUTS.map((item, i) => {
            if ('group' in item) {
              return (
                <div key={i} className={`text-[10px] text-accent uppercase tracking-widest font-semibold ${i > 0 ? 'mt-3' : ''} mb-1`}>
                  {item.group}
                </div>
              )
            }
            return (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-sm text-textDim">{item.desc}</span>
                <kbd className="text-[11px] font-mono bg-border text-text px-2 py-0.5 rounded ml-3 flex-shrink-0">
                  {item.key}
                </kbd>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}