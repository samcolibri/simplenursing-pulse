'use client'
import { useEffect, useState } from 'react'

export default function TikTokCallback() {
  const [code, setCode] = useState(null)
  const [state, setState] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setCode(params.get('code'))
    setState(params.get('state'))
    setError(params.get('error') || params.get('error_description'))
  }, [])

  const copy = () => {
    if (code) {
      navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)] mb-2">TikTok OAuth callback</div>
      <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-6">TikTok authorization</h1>

      {error && (
        <div className="card-strong p-5 border-[#fc3467]/30 mb-6">
          <div className="text-sm font-semibold text-[#fc3467] mb-2">❌ Authorization failed</div>
          <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap break-all">{error}</pre>
          <p className="text-xs text-[var(--text-dim)] mt-3">
            Common causes: sandbox user not added, scopes not granted, or invalid redirect URI.
            Check the TikTok app sandbox settings and try again.
          </p>
        </div>
      )}

      {code && (
        <div className="space-y-5">
          <div className="card-strong p-5 border-[#62d070]/30">
            <div className="text-sm font-semibold text-[#62d070] mb-3">✅ Authorization succeeded</div>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              You authorized the app. Below is a one-time code valid for ~5 minutes that the dashboard needs to exchange for a long-lived access token.
            </p>
            <div className="bg-[var(--bg-card-2)] border border-[var(--border)] rounded-lg p-3 mb-3">
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1.5">Authorization code</div>
              <div className="mono text-xs text-[#75c7e6] break-all">{code}</div>
            </div>
            {state && (
              <div className="text-[11px] text-[var(--text-dim)] mb-3">
                State: <span className="mono">{state}</span> (CSRF check)
              </div>
            )}
            <button
              onClick={copy}
              className="px-4 py-2 rounded-lg bg-[#75c7e6] text-[#005374] font-semibold text-sm hover:opacity-90 transition-all"
            >
              {copied ? '✓ Copied' : 'Copy code'}
            </button>
          </div>

          <div className="card-strong p-5">
            <div className="text-sm font-semibold mb-3">What happens next</div>
            <ol className="space-y-2 text-xs text-[var(--text-muted)] list-decimal pl-4">
              <li>Send this code to Sam via the dashboard chat</li>
              <li>Sam exchanges it for an access token (lasts 24 hours) + refresh token (lasts 365 days)</li>
              <li>Sam stores both as GitHub Secrets · <span className="mono">TIKTOK_ACCESS_TOKEN</span>, <span className="mono">TIKTOK_REFRESH_TOKEN</span></li>
              <li>The next hourly refresh pulls @simplenursing TikTok analytics live</li>
            </ol>
          </div>
        </div>
      )}

      {!code && !error && (
        <div className="card-strong p-5">
          <div className="text-sm font-semibold mb-2">Waiting for redirect parameters…</div>
          <p className="text-xs text-[var(--text-muted)]">
            This page captures the code TikTok appends to the redirect URL after a user authorizes the app.
            Visit the OAuth URL Sam provided to start the flow.
          </p>
        </div>
      )}
    </main>
  )
}
