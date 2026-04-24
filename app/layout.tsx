import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fenrir | 0xprit3sh',
  description: 'Graph-native threat intelligence platform',
  icons: {
    icon: '/fenrir/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-text antialiased">{children}</body>
    </html>
  )
}
