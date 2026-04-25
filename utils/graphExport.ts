export async function exportGraphAsPNG(): Promise<void> {
  const el = document.querySelector('.react-flow__renderer') as HTMLElement | null
  if (!el) {
    alert('No graph to export')
    return
  }

  try {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(el, {
      backgroundColor: getComputedStyle(document.documentElement)
        .getPropertyValue('--color-bg').trim() || '#0a0a0f',
      scale: 2,
      useCORS: true,
    })
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fenrir-graph-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    })
  } catch {
    // Fallback: use ReactFlow's built-in screenshot if html2canvas unavailable
    alert('PNG export unavailable. Try the JSON export instead.')
  }
}
