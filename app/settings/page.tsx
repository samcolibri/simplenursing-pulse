'use client'

import { useState } from 'react'
import { COMPETITOR_SEED } from '@/lib/data'
import { PlatformBadge } from '@/components/platform-badge'
import {
  CheckCircle2, AlertTriangle, Plus, Trash2, Download,
  Eye, EyeOff,
} from 'lucide-react'

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? 'bg-[#75c7e6]' : 'bg-[#1e2433]'}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow ${enabled ? 'translate-x-4' : 'translate-x-1'}`}
      />
    </button>
  )
}

function MaskedKey({ value }: { value: string }) {
  const [show, setShow] = useState(false)
  const masked = value ? value.slice(0, 8) + '••••••••••••••••' + value.slice(-4) : ''
  return (
    <div className="flex items-center gap-2">
      <code className="text-xs text-gray-400 font-mono">{show ? value : (value ? masked : '—')}</code>
      {value && (
        <button onClick={() => setShow(s => !s)} className="text-gray-600 hover:text-gray-400">
          {show ? <EyeOff size={12} /> : <Eye size={12} />}
        </button>
      )}
    </div>
  )
}

const PLATFORMS = [
  {
    id: 'instagram',
    label: 'Instagram',
    status: 'disconnected' as const,
    note: 'Meta Developer App with instagram_basic + instagram_content_publish permissions required',
    icon: '📷',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    status: 'disconnected' as const,
    note: 'Meta Developer App with pages_read_engagement + pages_read_user_content permissions required',
    icon: '📘',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    status: 'connected' as const,
    note: 'Connected via Apify scraper · Last sync: May 27, 2026 14:02 UTC',
    icon: '🎵',
    badge: 'Apify',
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    status: 'disconnected' as const,
    note: 'Pinterest API v5 app with boards:read + pins:read scopes required',
    icon: '📌',
  },
]

const API_KEYS = [
  { label: 'APIFY_TOKEN', value: 'apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', configured: true },
  { label: 'ANTHROPIC_API_KEY', value: '', configured: false },
  { label: 'META_ACCESS_TOKEN', value: '', configured: false },
  { label: 'META_PIXEL_ID', value: '', configured: false },
]

export default function SettingsPage() {
  const [alerts, setAlerts] = useState({
    viralCompetitor: true,
    ftcrDrop: true,
    weeklyRecs: true,
    trendingHashtags: false,
  })

  const [addHandle, setAddHandle] = useState('')
  const [addPlatform, setAddPlatform] = useState('tiktok')
  const [addTier, setAddTier] = useState('direct')

  function exportCSV() {
    const csv = 'Data export not yet implemented — connect platform APIs to enable full export'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'sn-data-export.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6 max-w-[800px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage platform connections, alert rules, and API keys</p>
      </div>

      {/* Platform Connections */}
      <section className="bg-[#0d1117] border border-[#1e2433] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2433]">
          <h2 className="text-sm font-semibold text-white">Platform Connections</h2>
        </div>
        <div className="divide-y divide-[#1e2433]">
          {PLATFORMS.map(platform => (
            <div key={platform.id} className="flex items-start gap-4 px-4 py-4">
              <span className="text-xl mt-0.5">{platform.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-white">{platform.label}</span>
                  {'badge' in platform && platform.badge && (
                    <span className="px-1.5 py-0.5 bg-[#75c7e6]/10 text-[#75c7e6] text-[10px] rounded font-medium">{platform.badge}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{platform.note}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {platform.status === 'connected' ? (
                  <div className="flex items-center gap-1.5 text-[#62d070]">
                    <CheckCircle2 size={13} />
                    <span className="text-xs font-medium">Connected</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 text-[#fad74f]">
                      <AlertTriangle size={13} />
                      <span className="text-xs text-gray-400">Not connected</span>
                    </div>
                    <button className="px-3 py-1.5 bg-[#161b22] border border-[#1e2433] text-xs text-gray-300 rounded-lg hover:border-[#75c7e6]/40 hover:text-white transition-colors">
                      Set up
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Apify account detail */}
          <div className="px-4 py-3 bg-[#0a0f1a]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Apify account</p>
                <p className="text-sm text-white font-medium">harmonious_notation</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Plan</p>
                <p className="text-xs text-[#62d070] font-medium">FREE · ~$5/mo credits</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Competitor Management */}
      <section className="bg-[#0d1117] border border-[#1e2433] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2433]">
          <h2 className="text-sm font-semibold text-white">Competitor Management</h2>
        </div>
        <div className="p-4 space-y-2">
          {COMPETITOR_SEED.map((comp, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-[#1e2433] last:border-0">
              <PlatformBadge platform={comp.platform as 'instagram' | 'facebook' | 'tiktok'} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{comp.display_name}</p>
                <p className="text-xs text-gray-500">@{comp.handle}</p>
              </div>
              <span className="text-xs text-gray-500">{comp.followers.toLocaleString()} followers</span>
              <button className="text-gray-600 hover:text-red-400 transition-colors ml-2">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 mb-2 font-medium">Add competitor</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="@handle"
              value={addHandle}
              onChange={e => setAddHandle(e.target.value)}
              className="flex-1 bg-[#161b22] border border-[#1e2433] text-sm text-white rounded-lg px-3 py-2 placeholder-gray-700 focus:outline-none focus:border-[#75c7e6]/50"
            />
            <select
              value={addPlatform}
              onChange={e => setAddPlatform(e.target.value)}
              className="bg-[#161b22] border border-[#1e2433] text-sm text-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:border-[#75c7e6]/50"
            >
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="youtube">YouTube</option>
            </select>
            <select
              value={addTier}
              onChange={e => setAddTier(e.target.value)}
              className="bg-[#161b22] border border-[#1e2433] text-sm text-gray-300 rounded-lg px-2 py-2 focus:outline-none focus:border-[#75c7e6]/50"
            >
              <option value="direct">Direct</option>
              <option value="adjacent">Adjacent</option>
              <option value="aspirational">Aspirational</option>
            </select>
            <button className="px-3 py-2 bg-[#75c7e6] text-[#005374] font-semibold text-sm rounded-lg hover:bg-[#75c7e6]/90 transition-colors">
              <Plus size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Alert Rules */}
      <section className="bg-[#0d1117] border border-[#1e2433] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2433]">
          <h2 className="text-sm font-semibold text-white">Alert Rules</h2>
        </div>
        <div className="divide-y divide-[#1e2433]">
          {[
            { key: 'viralCompetitor' as const, label: 'Alert when competitor posts go viral (>100K views)', sub: 'Sends notification when any tracked competitor exceeds threshold' },
            { key: 'ftcrDrop' as const, label: 'Alert when our FTCR drops >20%', sub: 'Free Trial Conversion Rate — week-over-week comparison' },
            { key: 'weeklyRecs' as const, label: 'Weekly AI recommendations', sub: 'Get a fresh batch of AI-generated content recommendations every Monday' },
            { key: 'trendingHashtags' as const, label: 'Trending hashtag alerts', sub: 'Notify when a relevant nursing hashtag reaches >5% 24h velocity' },
          ].map(rule => (
            <div key={rule.key} className="flex items-center gap-4 px-4 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{rule.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{rule.sub}</p>
              </div>
              <Toggle
                enabled={alerts[rule.key]}
                onChange={v => setAlerts(prev => ({ ...prev, [rule.key]: v }))}
              />
            </div>
          ))}
        </div>
      </section>

      {/* API Keys */}
      <section className="bg-[#0d1117] border border-[#1e2433] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2433]">
          <h2 className="text-sm font-semibold text-white">API Keys</h2>
          <p className="text-xs text-gray-500 mt-0.5">Keys are read from environment variables. Set them in .env.local.</p>
        </div>
        <div className="divide-y divide-[#1e2433]">
          {API_KEYS.map(key => (
            <div key={key.label} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-gray-300 mb-0.5">{key.label}</p>
                <MaskedKey value={key.value} />
              </div>
              {key.configured ? (
                <div className="flex items-center gap-1.5 text-[#62d070] shrink-0">
                  <CheckCircle2 size={13} />
                  <span className="text-xs">Configured</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[#fad74f] shrink-0">
                  <AlertTriangle size={13} />
                  <span className="text-xs text-gray-500">Not set</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Data Export */}
      <section className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Data Export</h2>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-[#1e2433] text-sm text-gray-300 rounded-lg hover:border-[#75c7e6]/40 hover:text-white transition-colors"
          >
            <Download size={14} />
            Export all data as CSV
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border border-[#1e2433] text-sm text-gray-300 rounded-lg hover:border-[#75c7e6]/40 hover:text-white transition-colors"
          >
            <Download size={14} />
            Download Excel-compatible report
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">Full exports available once Meta API is connected. Current data includes TikTok monthly metrics.</p>
      </section>
    </div>
  )
}
