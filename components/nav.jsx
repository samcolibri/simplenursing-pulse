'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { href: '/pulse',       label: 'Pulse',       short: 'Overview' },
  { href: '/platforms',   label: 'Platforms',   short: 'Per platform' },
  { href: '/competitors', label: 'Competitors', short: 'Live monitoring' },
  { href: '/content',     label: 'Content',     short: 'All posts' },
  { href: '/trends',      label: 'Trends',      short: 'Audio + hashtags' },
  { href: '/budget',      label: 'Budget',      short: '2026 spend' },
]

const base = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BASE_PATH ? process.env.NEXT_PUBLIC_BASE_PATH : ''

function timeAgo(iso) {
  if (!iso) return '—'
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return m + 'm ago'
  const h = Math.floor(m / 60); if (h < 24) return h + 'h ago'
  return Math.floor(h / 24) + 'd ago'
}

export default function Nav() {
  const pathname = usePathname() || ''
  const [open, setOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    fetch(base + '/data/last-updated.json', { cache: 'no-store' })
      .then(r => r.json()).then(d => setLastUpdated(d.fetched_at)).catch(() => {})
  }, [])

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Active matcher: /pulse matches both /pulse and / for root
  const isActive = (href) => {
    if (href === '/pulse' && (pathname === '/' || pathname === '')) return true
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#06060a]/85 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-3 gap-4">
            {/* Logo */}
            <Link href="/pulse" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#75c7e6] to-[#fc3467] flex items-center justify-center text-xs font-black text-white">SN</div>
              <div className="leading-tight">
                <div className="text-sm font-bold tracking-tight">SimpleNursing Pulse</div>
                <div className="text-[10px] text-[var(--text-dim)] hidden sm:block">Real-time social intelligence</div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {NAV_ITEMS.map(item => {
                const active = isActive(item.href)
                return (
                  <Link key={item.href} href={item.href}
                    className={'px-3 py-1.5 text-xs font-medium rounded-lg transition-all ' +
                      (active ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5')}>
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Live indicator */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#62d070] live-dot" />
                <span className="text-[10px] text-[var(--text-muted)]"><span className="hidden sm:inline">Refreshed </span><span className="text-white font-medium">{timeAgo(lastUpdated)}</span></span>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setOpen(!open)}
                className="md:hidden p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-white"
                aria-label="Toggle menu"
              >
                {open ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden border-t border-[var(--border)] bg-[#06060a]">
            <nav className="px-4 py-3 space-y-1 max-w-7xl mx-auto">
              {NAV_ITEMS.map(item => {
                const active = isActive(item.href)
                return (
                  <Link key={item.href} href={item.href}
                    className={'flex items-center justify-between px-3 py-2.5 rounded-lg ' +
                      (active ? 'bg-white/10 text-white' : 'text-[var(--text-muted)] hover:bg-white/5')}>
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-[10px] text-[var(--text-dim)]">{item.short}</span>
                  </Link>
                )
              })}
              <div className="flex items-center gap-2 px-3 pt-3 mt-2 border-t border-[var(--border)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#62d070] live-dot" />
                <span className="text-[11px] text-[var(--text-muted)]">Refreshed <span className="text-white font-medium">{timeAgo(lastUpdated)}</span></span>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
