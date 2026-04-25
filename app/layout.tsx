import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fenrir | 0xprit3sh',
  description: 'Graph-native threat intelligence platform',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
