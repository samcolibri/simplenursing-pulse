import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'SimpleNursing Pulse — Real-time Social Intelligence',
  description: 'Live social analytics for SimpleNursing across TikTok, Instagram, Facebook, Pinterest. Refreshes every hour via Apify + Pinterest API.',
  themeColor: '#0a0a0f',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className + ' bg-[#06060a] text-white min-h-screen antialiased'}>
        {children}
      </body>
    </html>
  )
}
