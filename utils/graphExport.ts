export async function exportGraphAsPNG(elementId = 'react-flow-canvas'): Promise<void> {
  const el = document.querySelector('.react-flow__renderer') as HTMLElement | null
  if (!el) return

  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(el, {
    backgroundColor: '#0a0a0f',
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
}
