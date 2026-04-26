'use client'
import { useState, useEffect, useRef } from 'react'
import { X, ChevronRight, ChevronLeft, Zap } from 'lucide-react'
import clsx from 'clsx'

interface Step {
  title: string
  description: string
  highlight?: string  // CSS selector to highlight
  position: 'center' | 'top' | 'bottom' | 'left' | 'right'
  emoji: string
}

const STEPS: Step[] = [
  {
    emoji: '⬡',
    title: 'Welcome to Fenrir',
    description: 'Graph-native threat intelligence. Investigate IPs, domains, URLs and file hashes by building interactive relationship graphs. Built 100% in your browser — no data leaves your device.',
    position: 'center',
  },
  {
    emoji: '🔍',
    title: 'Search Any Indicator',
    description: 'Type or paste any IP address, domain, URL or file hash (MD5/SHA1/SHA256) in the search bar. Fenrir auto-detects the type and runs all available scanners in parallel.',
    highlight: 'header',
    position: 'bottom',
  },
  {
    emoji: '🕸️',
    title: 'The Investigation Graph',
    description: 'Every search creates a root node. As scanners return results, related indicators automatically appear as connected nodes. Click any node to inspect it. Drag nodes to rearrange.',
    position: 'center',
  },
  {
    emoji: '📊',
    title: 'Intel Panel',
    description: 'Click any node to open the Intel Panel. It shows risk score, geolocation, MITRE ATT&CK techniques, results from each scanner, and lets you add investigation notes.',
    position: 'center',
  },
  {
    emoji: '🔑',
    title: 'Add Your API Keys',
    description: 'Open Settings (⚙ bottom right) to add API keys for VirusTotal, Shodan, OTX and more. Free providers like MalwareBazaar, WHOIS, BGPView and ip-api.com work automatically with no keys.',
    position: 'center',
  },
  {
    emoji: '⚑',
    title: 'MITRE ATT&CK Mapping',
    description: 'Fenrir automatically maps threat tags to MITRE ATT&CK techniques. Open the Intel Panel → ATT&CK tab to see all detected techniques grouped by tactic with links to the framework.',
    position: 'center',
  },
  {
    emoji: '✦',
    title: 'AI Threat Summary',
    description: 'After enriching your graph, open Intel Panel → AI tab and click Analyze. Uses Google Gemini (free, 1500/day) or Groq Llama 3 (free, 14k/day) to generate a threat analyst summary.',
    position: 'center',
  },
  {
    emoji: '⌨️',
    title: 'Keyboard Shortcuts',
    description: '/ — focus search\nE — enrich selected node\nR — re-layout graph\nT — toggle dark/light\nP — toggle panel\nI — open IOC extractor\nShift+X — export\nEsc — deselect node\nShift+Del — remove node',
    position: 'center',
  },
  {
    emoji: '📤',
    title: 'Export Your Investigation',
    description: 'Export as Fenrir JSON, STIX 2.1 bundle, defanged IOC list, PDF report, or Markdown report. Use the IOC Extractor (I) to auto-extract indicators from any text.',
    position: 'center',
  },
  {
    emoji: '🚀',
    title: "You're Ready",
    description: "Start by searching an IP like 8.8.8.8, a domain like google.com, or paste a suspicious URL. The graph builds itself as results come in. Happy hunting.",
    position: 'center',
  },
]

const TOUR_KEY = 'fenrir-tour-complete'

export function useTourState() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Slight delay so app renders first
    const timer = setTimeout(() => {
      if (!localStorage.getItem(TOUR_KEY)) setShow(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const complete = () => {
    localStorage.setItem(TOUR_KEY, '1')
    setShow(false)
  }

  const restart = () => {
    localStorage.removeItem(TOUR_KEY)
    setShow(true)
  }

  return { show, complete, restart }
}

interface TourProps {
  onComplete: () => void
}

export default function OnboardingTour({ onComplete }: TourProps) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isFirst = step === 0

  const next = () => isLast ? onComplete() : setStep(s => s + 1)
  const prev = () => setStep(s => Math.max(0, s - 1))
  const skip = () => onComplete()

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') skip()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [step])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border rounded-2xl shadow-glow w-full max-w-md flex flex-col overflow-hidden">
        {/* Progress bar */}
        <div className="h-0.5 bg-border">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          {/* Emoji + step counter */}
          <div className="flex items-center justify-between">
            <span className="text-3xl">{current.emoji}</span>
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={clsx(
                    'rounded-full transition-all',
                    i === step ? 'w-4 h-2 bg-accent' : 'w-2 h-2 bg-border hover:bg-muted'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-lg font-bold text-text">{current.title}</h2>
            <p className="text-sm text-textDim mt-2 leading-relaxed whitespace-pre-line">
              {current.description}
            </p>
          </div>

          {/* Shortcut hint */}
          {step > 0 && (
            <div className="flex items-center gap-2 text-[10px] text-muted">
              <kbd className="bg-border px-1.5 py-0.5 rounded font-mono">←→</kbd>
              <span>navigate</span>
              <kbd className="bg-border px-1.5 py-0.5 rounded font-mono">Esc</kbd>
              <span>skip</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-border">
          <button
            onClick={skip}
            className="text-xs text-muted hover:text-text transition-colors mr-auto"
          >
            Skip tour
          </button>
          {!isFirst && (
            <button
              onClick={prev}
              className="flex items-center gap-1 px-3 py-2 border border-border rounded-xl text-sm text-muted hover:text-text transition-colors"
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}
          <button
            onClick={next}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-xl text-sm font-medium transition-colors"
          >
            {isLast ? (
              <><Zap size={13} /> Start Hunting</>
            ) : (
              <>Next <ChevronRight size={14} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}