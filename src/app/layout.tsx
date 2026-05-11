import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'MyTradeHelper — Auto Trading Monitor',
  description: 'Monitor and automate your Bursa Malaysia and US market trades',
  manifest: '/MytradingHelper/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'MyTradeHelper' },
}

export const viewport: Viewport = {
  themeColor: '#0a0f1e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          html, body { background-color: #0a0f1e !important; color: #e2e8f0; }
          * { box-sizing: border-box; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </head>
      <body style={{ backgroundColor: '#0a0f1e', color: '#e2e8f0', margin: 0, padding: 0, overflowX: 'hidden' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
