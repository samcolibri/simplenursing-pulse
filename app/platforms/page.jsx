'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PlatformsPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/pulse') }, [router])

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center">
      <div className="card-strong p-8 sm:p-12 max-w-lg text-center space-y-4 rounded-2xl">
        <div className="text-4xl">📊</div>
        <h1 className="text-xl sm:text-2xl font-bold">Platform Analytics Moved</h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          This page used to show charts from a static spreadsheet (Jan–Apr 2026 only).<br/>
          It has been replaced by the <span className="text-[#75c7e6] font-semibold">Pulse</span> page,
          which shows 100% live data — all platforms, any date range you select.
        </p>
        <p className="text-xs text-[var(--text-dim)]">Redirecting you to Pulse now…</p>
        <a href="/pulse"
          className="inline-block mt-2 px-6 py-2.5 rounded-xl bg-[#75c7e6] text-black font-semibold text-sm hover:opacity-90 transition-opacity">
          Go to Pulse →
        </a>
      </div>
    </div>
  )
}
