'use client'
import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, Legend } from 'recharts'
import {
  INSTAGRAM_2026, INSTAGRAM_2025,
  FACEBOOK_2026, FACEBOOK_2025,
  TIKTOK_2026, TIKTOK_2025,
  MONTHS, latestMonth, VERIFIED_SOURCE,
} from '@/lib/excel-data'

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n == null || isNaN(n)) return '—'
  if (n === 0) return '0'
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}
const fmtFull = (n) => n == null ? '—' : Number(n).toLocaleString()
const fmtPct = (n) => n == null ? '—' : (n * 100).toFixed(1) + '%'
const fmtMoney = (n) => n == null ? '—' : '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })
const timeAgo = (iso) => {
  if (!iso) return '—'
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return m + 'm ago'
  const h = Math.floor(m / 60); if (h < 24) return h + 'h ago'
  return Math.floor(h / 24) + 'd ago'
}

const PLATFORM = {
  tiktok:    { name: 'TikTok',    color: '#75c7e6', glow: 'glow-tt',  glyph: '🎵', tag: 'tt' },
  instagram: { name: 'Instagram', color: '#fc3467', glow: 'glow-ig',  glyph: '📷', tag: 'ig' },
  facebook:  { name: 'Facebook',  color: '#00709c', glow: 'glow-fb',  glyph: '📘', tag: 'fb' },
  pinterest: { name: 'Pinterest', color: '#e60036', glow: 'glow-pin', glyph: '📌', tag: 'pin' },
}

function useStaticData(file) {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
    fetch(base + '/data/' + file + '.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(setData).catch(setErr)
  }, [file])
  return { data, err, loading: !data && !err }
}

// ── tiny components ──────────────────────────────────────────────────────────
function SourceTag({ source }) {
  const colors = {
    'apify-live':  'bg-[#62d070]/10 text-[#62d070] border-[#62d070]/30',
    'pinterest-api': 'bg-[#62d070]/10 text-[#62d070] border-[#62d070]/30',
    'xlsx': 'bg-[#75c7e6]/10 text-[#75c7e6] border-[#75c7e6]/30',
    'pending': 'bg-[#fad74f]/10 text-[#fad74f] border-[#fad74f]/30',
  }
  const labels = {
    'apify-live': 'LIVE via Apify',
    'pinterest-api': 'LIVE via Pinterest API',
    'xlsx': 'Verified · Excel Apr 2026',
    'pending': 'Meta API pending',
  }
  return (
    <span className={`mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${colors[source] || ''}`}>
      {labels[source] || source}
    </span>
  )
}

function PlatformCard({ platform, primary, secondary, tertiary, source }) {
  const p = PLATFORM[platform]
  return (
    <div className={`card-strong p-5 sm:p-6 ${p.glow} fade-up`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">{p.glyph}</span>
          <span className="text-sm font-semibold tracking-tight">{p.name}</span>
        </div>
        <SourceTag source={source} />
      </div>
      <div className="mb-4">
        <div className="num-xl text-3xl sm:text-4xl text-white">{primary.value}</div>
        <div className="text-xs text-[var(--text-dim)] mt-1">{primary.label}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--border)]">
        <div>
          <div className="text-sm sm:text-base font-semibold">{secondary.value}</div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mt-0.5">{secondary.label}</div>
        </div>
        <div>
          <div className="text-sm sm:text-base font-semibold">{tertiary.value}</div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mt-0.5">{tertiary.label}</div>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ eyebrow, title, subtitle, right }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4 sm:mb-5">
      <div>
        {eyebrow && <div className="mono text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">{eyebrow}</div>}
        <h2 className="text-lg sm:text-2xl font-bold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

// ── main page ────────────────────────────────────────────────────────────────
export default function PulsePage() {
  const tt = useStaticData('tiktok')
  const ig = useStaticData('instagram')
  const pin = useStaticData('pinterest')
  const insights = useStaticData('insights')
  const ttTrends = useStaticData('tiktok_trends')
  const meta = useStaticData('last-updated')

  // ─── EXCEL data (last verified month — Apr 2026) ────────────────────────────
  const ig_latest_views = latestMonth(INSTAGRAM_2026.total_views)
  const ig_latest_reach = latestMonth(INSTAGRAM_2026.accounts_reached)
  const ig_latest_trials = latestMonth(INSTAGRAM_2026.free_trials)
  const fb_latest_views = latestMonth(FACEBOOK_2026.views)
  const fb_latest_reach = latestMonth(FACEBOOK_2026.accounts_reached)
  const fb_latest_trials = latestMonth(FACEBOOK_2026.free_trials)
  const tt_latest_views = latestMonth(TIKTOK_2026.views)
  const tt_latest_engaged = latestMonth(TIKTOK_2026.engaged_audience)
  const tt_latest_trials = latestMonth(TIKTOK_2026.free_trials)

  const yoyData = MONTHS.map((m, i) => ({
    month: m,
    'TT 2026': TIKTOK_2026.views[i],
    'TT 2025': TIKTOK_2025.views[i],
    'IG 2026': INSTAGRAM_2026.total_views[i],
    'IG 2025': INSTAGRAM_2025.accounts_reached[i],
    'FB 2026': FACEBOOK_2026.views[i],
  }))

  const competitorBars = useMemo(() => {
    const out = []
    if (tt.data?.owned) out.push({ name: 'SimpleNursing · TT', followers: tt.data.owned.followers, platform: 'tiktok', owned: true })
    for (const c of (tt.data?.competitors || [])) out.push({ name: (c.display_name || c.handle) + ' · TT', followers: c.followers, platform: 'tiktok', owned: false })
    if (ig.data?.owned) out.push({ name: 'SimpleNursing · IG', followers: ig.data.owned.followers, platform: 'instagram', owned: true })
    for (const c of (ig.data?.competitors || [])) out.push({ name: (c.display_name || c.handle) + ' · IG', followers: c.followers, platform: 'instagram', owned: false })
    return out.sort((a, b) => b.followers - a.followers)
  }, [tt.data, ig.data])

  const fundsData = MONTHS.slice(0, 4).map((m, i) => ({
    month: m,
    'TikTok': TIKTOK_2026.free_trials[i],
    'Instagram': INSTAGRAM_2026.free_trials[i],
    'Facebook': FACEBOOK_2026.free_trials[i],
  }))

  const revenueData = MONTHS.slice(0, 4).map((m, i) => ({
    month: m,
    'TikTok GA4': TIKTOK_2026.revenue_ga4[i],
    'Instagram GA4': INSTAGRAM_2026.revenue_ga4[i],
    'Facebook GA4': FACEBOOK_2026.revenue_ga4[i],
  }))

  // top viral alert (most viral non-owned competitor post)
  const viralAlert = useMemo(() => {
    if (!insights.data?.top_viral) return null
    const top = insights.data.top_viral.find(p => !p.isOwned)
    return top
  }, [insights.data])

  return (
    <div className="min-h-screen bg-gradient-mesh">
      {/* HEADER */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#06060a]/80 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#75c7e6] to-[#fc3467] flex items-center justify-center text-xs font-black text-white">SN</div>
            <div>
              <div className="text-sm font-bold tracking-tight leading-tight">SimpleNursing Pulse</div>
              <div className="text-[10px] text-[var(--text-dim)] hidden sm:block leading-tight">Real-time social intelligence</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#62d070] live-dot" />
            <span className="text-[10px] sm:text-xs text-[var(--text-muted)]">
              <span className="hidden sm:inline">Refreshed </span>
              <span className="text-white font-medium">{timeAgo(meta.data?.fetched_at)}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* HERO */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)]">Live · auto-refreshed hourly</span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
            All four platforms.<br/>
            <span className="bg-gradient-to-r from-[#75c7e6] via-[#fc3467] to-[#e60036] bg-clip-text text-transparent">One live dashboard.</span>
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-2xl">
            Owned + competitor analytics across TikTok, Instagram, Facebook, Pinterest. Apify scrapes update every hour via GitHub Actions. Excel-verified historicals for Jan-Apr 2026.
          </p>
        </section>

        {/* VIRAL ALERT */}
        {viralAlert && (
          <a href={viralAlert.url} target="_blank" rel="noreferrer" className="block card-strong p-4 sm:p-5 hover:border-[#fc3467]/40 transition-all fade-up">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="mono text-[10px] uppercase tracking-widest text-[#fc3467] font-bold">🔥 Competitor virality alert</span>
                <SourceTag source="apify-live" />
              </div>
              <span className="text-[11px] text-[var(--text-dim)]">@{viralAlert.handle} · {PLATFORM[viralAlert.platform].name}</span>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              {viralAlert.thumbnail && (
                <img src={viralAlert.thumbnail} alt="" className="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-lg flex-shrink-0" referrerPolicy="no-referrer" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-white line-clamp-2 mb-2">{viralAlert.caption || viralAlert.title}</p>
                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs">
                  <div><span className="text-[var(--text-dim)]">Views:</span> <span className="font-bold">{fmt(viralAlert.views)}</span></div>
                  <div><span className="text-[var(--text-dim)]">Likes:</span> <span className="font-bold">{fmt(viralAlert.likes)}</span></div>
                  {viralAlert.comments > 0 && <div><span className="text-[var(--text-dim)]">Comments:</span> <span className="font-bold">{fmt(viralAlert.comments)}</span></div>}
                </div>
              </div>
            </div>
          </a>
        )}

        {/* PLATFORM HEROES */}
        <section>
          <SectionHeader
            eyebrow="01 · Platform overview"
            title="Today's snapshot"
            subtitle="Live followers from Apify · April 2026 monthly metrics from Excel tracker"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <PlatformCard
              platform="tiktok"
              source={tt.data?.owned ? 'apify-live' : 'pending'}
              primary={{ value: fmt(tt.data?.owned?.followers), label: 'Followers (live)' }}
              secondary={{ value: fmt(tt_latest_views?.value), label: `${tt_latest_views?.month} 2026 views` }}
              tertiary={{ value: fmtFull(tt_latest_trials?.value), label: `${tt_latest_trials?.month} 2026 free trials` }}
            />
            <PlatformCard
              platform="instagram"
              source={ig.data?.owned ? 'apify-live' : 'pending'}
              primary={{ value: fmt(ig.data?.owned?.followers), label: 'Followers (live)' }}
              secondary={{ value: fmt(ig_latest_reach?.value), label: `${ig_latest_reach?.month} 2026 reach` }}
              tertiary={{ value: fmtFull(ig_latest_trials?.value), label: `${ig_latest_trials?.month} 2026 free trials` }}
            />
            <PlatformCard
              platform="facebook"
              source="xlsx"
              primary={{ value: fmt(fb_latest_views?.value), label: `${fb_latest_views?.month} 2026 views` }}
              secondary={{ value: fmt(fb_latest_reach?.value), label: `${fb_latest_reach?.month} 2026 reach` }}
              tertiary={{ value: fmtFull(fb_latest_trials?.value), label: `${fb_latest_trials?.month} free trials` }}
            />
            <PlatformCard
              platform="pinterest"
              source={pin.data ? 'pinterest-api' : 'pending'}
              primary={{ value: fmt(pin.data?.profile?.monthly_views), label: 'Monthly views (live)' }}
              secondary={{ value: fmt(pin.data?.summary?.impressions), label: '30d impressions' }}
              tertiary={{ value: fmt(pin.data?.summary?.saves), label: '30d saves' }}
            />
          </div>
        </section>

        {/* WHAT'S WORKING NOW */}
        <section>
          <SectionHeader
            eyebrow="02 · What's working right now"
            title="Top viral posts across all 8 tracked accounts"
            subtitle="Ranked by engagement · auto-refreshed every hour"
            right={<SourceTag source="apify-live" />}
          />
          {insights.loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card skel aspect-[4/5]" />
              ))}
            </div>
          )}
          {insights.data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {insights.data.top_viral.slice(0, 8).map((post, i) => {
                const p = PLATFORM[post.platform]
                return (
                  <a key={i}
                    href={post.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group card overflow-hidden hover:-translate-y-0.5 transition-all fade-up"
                    style={{ animationDelay: i * 60 + 'ms' }}
                  >
                    <div className="aspect-[4/5] sm:aspect-square bg-[var(--bg-card-2)] relative overflow-hidden">
                      {post.thumbnail ? (
                        <img src={post.thumbnail} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">{p.glyph}</div>
                      )}
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white" style={{ background: p.color }}>{post.platform}</span>
                        {post.isOwned && <span className="mono text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#62d070] text-black">Ours</span>}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent">
                        <div className="num-xl text-lg text-white">{fmt(post.views || post.likes)}</div>
                        <div className="text-[10px] text-white/70 uppercase mono">{post.views ? 'views' : 'likes'}</div>
                      </div>
                    </div>
                    <div className="p-2.5 sm:p-3">
                      <p className="text-xs leading-snug line-clamp-2 text-white/90 mb-1.5">{post.caption || post.title || '(no caption)'}</p>
                      <div className="flex items-center justify-between text-[10px] text-[var(--text-dim)]">
                        <span className="truncate">@{post.handle}</span>
                        {post.likes > 0 && post.views > 0 && (
                          <span className="mono">ER {((post.likes / post.views) * 100).toFixed(1)}%</span>
                        )}
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </section>

        {/* COMPETITOR LADDER */}
        <section>
          <SectionHeader
            eyebrow="03 · Follower competitive position"
            title="Where we rank vs direct nursing competitors"
            subtitle="Live follower counts from Apify · scraped this refresh"
            right={<SourceTag source="apify-live" />}
          />
          <div className="card-strong p-3 sm:p-5">
            <div className="h-[320px] sm:h-[380px] -mx-2 sm:mx-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={competitorBars} layout="vertical" margin={{ left: 0, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={fmt} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} width={130} />
                  <Tooltip
                    contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 11 }}
                    formatter={(v) => [fmtFull(v) + ' followers', '']}
                    cursor={{ fill: '#ffffff08' }}
                  />
                  <Bar dataKey="followers" radius={[0, 4, 4, 0]}>
                    {competitorBars.map((d, i) => (
                      <Cell key={i} fill={d.owned ? PLATFORM[d.platform].color : PLATFORM[d.platform].color + '55'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] sm:text-xs text-[var(--text-dim)] mt-2 sm:mt-3">
              Solid bars = SimpleNursing · Translucent = competitor. NurseInTheMaking currently leads both IG &amp; TT.
            </p>
          </div>
        </section>

        {/* YEAR OVER YEAR */}
        <section>
          <SectionHeader
            eyebrow="04 · Year-over-year"
            title="2026 vs 2025 monthly trajectory"
            subtitle="Source: Social Performance Tracker (2026).xlsx · verified May 2026"
            right={<SourceTag source="xlsx" />}
          />
          <div className="card-strong p-3 sm:p-5">
            <div className="h-[280px] sm:h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yoyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
                  <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={fmt} />
                  <Tooltip
                    contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 11 }}
                    formatter={(v) => fmtFull(v)}
                  />
                  <Legend wrapperStyle={{ fontSize: 10 }} iconType="line" />
                  <Line type="monotone" dataKey="TT 2026" stroke="#75c7e6" strokeWidth={2.5} dot={{ r: 3, fill: '#75c7e6' }} />
                  <Line type="monotone" dataKey="TT 2025" stroke="#75c7e6" strokeWidth={1.5} strokeDasharray="4 4" dot={false} opacity={0.5} />
                  <Line type="monotone" dataKey="IG 2026" stroke="#fc3467" strokeWidth={2.5} dot={{ r: 3, fill: '#fc3467' }} />
                  <Line type="monotone" dataKey="FB 2026" stroke="#00709c" strokeWidth={2.5} dot={{ r: 3, fill: '#00709c' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] sm:text-xs text-[var(--text-dim)] mt-2">Dashed lines = 2025. April 2026 is last fully reported month.</p>
          </div>
        </section>

        {/* TOPIC INTELLIGENCE + TIKTOK SOUNDS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <SectionHeader
              eyebrow="05 · Topic intelligence"
              title="What nursing topics are winning"
              subtitle="Auto-clustered from live viral captions"
              right={<SourceTag source="apify-live" />}
            />
            <div className="card-strong p-4 sm:p-5">
              {insights.data?.topics?.length > 0 ? (
                <div className="space-y-3">
                  {insights.data.topics.slice(0, 8).map(([topic, score], i) => {
                    const max = insights.data.topics[0][1]
                    return (
                      <div key={topic}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-medium">{topic}</span>
                          <span className="mono text-[10px] text-[var(--text-dim)]">{fmt(score)} eng</span>
                        </div>
                        <div className="h-2 bg-[var(--bg-card-2)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${(score / max) * 100}%`,
                            background: i === 0 ? '#fc3467' : i < 3 ? '#fad74f' : '#75c7e6',
                          }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-xs text-[var(--text-dim)] py-8 text-center">Awaiting refresh…</div>
              )}
            </div>
          </div>

          <div>
            <SectionHeader
              eyebrow="06 · Trending audio"
              title="TikTok sounds gaining traction"
              subtitle={"From '" + (ttTrends.data?.queries?.[0] || 'nursing') + "' search · most-viewed first"}
              right={<SourceTag source="apify-live" />}
            />
            <div className="card-strong p-2 sm:p-3 max-h-[420px] overflow-y-auto">
              {ttTrends.data?.sounds?.length > 0 ? (
                <div className="space-y-1">
                  {ttTrends.data.sounds.slice(0, 10).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-card-2)] transition-all">
                      <div className="mono text-[10px] text-[var(--text-dim)] w-5">{i + 1}</div>
                      <div className="text-base">🎵</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">{s.name}</div>
                        <div className="text-[10px] text-[var(--text-dim)] truncate">{s.author || '—'} · used {s.uses}×</div>
                      </div>
                      <div className="text-xs font-semibold mono text-[#75c7e6]">{fmt(s.total_views)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[var(--text-dim)] py-8 text-center">No trends loaded yet</div>
              )}
            </div>
          </div>
        </section>

        {/* PINTEREST 30-DAY */}
        {pin.data?.daily && (
          <section>
            <SectionHeader
              eyebrow="07 · Pinterest deep dive"
              title="30-day Pinterest impression curve"
              subtitle={`${pin.data?.summary?.period} · ${fmt(pin.data?.summary?.impressions)} impressions · ${fmt(pin.data?.summary?.saves)} saves`}
              right={<SourceTag source="pinterest-api" />}
            />
            <div className="card-strong p-3 sm:p-5">
              <div className="h-[240px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pin.data.daily.map(d => ({
                    date: d.date.slice(5),
                    impressions: d.metrics?.IMPRESSION || 0,
                    saves: d.metrics?.SAVE || 0,
                    pin_clicks: d.metrics?.PIN_CLICK || 0,
                  }))}>
                    <defs>
                      <linearGradient id="pinGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e60036" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#e60036" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 9 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={fmt} />
                    <Tooltip
                      contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 11 }}
                      formatter={(v) => fmtFull(v)}
                    />
                    <Area type="monotone" dataKey="impressions" stroke="#e60036" strokeWidth={2.5} fill="url(#pinGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {/* FUNNEL — EXCEL VERIFIED */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <SectionHeader
              eyebrow="08 · Conversion funnel"
              title="Free trials by platform"
              subtitle="Jan–Apr 2026 · weekly cohort flow"
              right={<SourceTag source="xlsx" />}
            />
            <div className="card-strong p-3 sm:p-5">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fundsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="TikTok" fill="#75c7e6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Instagram" fill="#fc3467" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Facebook" fill="#00709c" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div>
            <SectionHeader
              eyebrow="09 · Revenue attribution"
              title="GA4 revenue by platform"
              subtitle="Jan–Apr 2026 · UTM-attributed sessions"
              right={<SourceTag source="xlsx" />}
            />
            <div className="card-strong p-3 sm:p-5">
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={(v) => '$' + fmt(v)} />
                    <Tooltip
                      contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 11 }}
                      formatter={(v) => fmtMoney(v)}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="TikTok GA4" fill="#75c7e6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Instagram GA4" fill="#fc3467" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Facebook GA4" fill="#00709c" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* PIPELINE TABLE */}
        <section>
          <SectionHeader
            eyebrow="10 · Excel funnel"
            title="Pipeline at a glance"
            subtitle="Per-platform 2026 vs 2025 — verified from XLSX"
            right={<SourceTag source="xlsx" />}
          />
          <div className="card-strong overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-3 sm:px-5 py-3 text-[var(--text-dim)] mono text-[10px] uppercase tracking-wider">Metric</th>
                  <th className="text-right px-3 sm:px-5 py-3 text-[#75c7e6] mono text-[10px] uppercase tracking-wider">TikTok</th>
                  <th className="text-right px-3 sm:px-5 py-3 text-[#fc3467] mono text-[10px] uppercase tracking-wider">Instagram</th>
                  <th className="text-right px-3 sm:px-5 py-3 text-[#00709c] mono text-[10px] uppercase tracking-wider">Facebook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                <tr><td className="px-3 sm:px-5 py-3">Apr 2026 views</td>
                    <td className="px-3 sm:px-5 py-3 text-right font-semibold">{fmtFull(TIKTOK_2026.views[3])}</td>
                    <td className="px-3 sm:px-5 py-3 text-right font-semibold">{fmtFull(INSTAGRAM_2026.total_views[3])}</td>
                    <td className="px-3 sm:px-5 py-3 text-right font-semibold">{fmtFull(FACEBOOK_2026.views[3])}</td></tr>
                <tr><td className="px-3 sm:px-5 py-3">Apr 2026 engaged audience</td>
                    <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(TIKTOK_2026.engaged_audience[3])}</td>
                    <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(INSTAGRAM_2026.accounts_reached[3])}</td>
                    <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(FACEBOOK_2026.accounts_reached[3])}</td></tr>
                <tr><td className="px-3 sm:px-5 py-3">Apr 2026 new follows</td>
                    <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(TIKTOK_2026.new_follows[3])}</td>
                    <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(INSTAGRAM_2026.new_follows[3])}</td>
                    <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(FACEBOOK_2026.new_follows[3])}</td></tr>
                <tr><td className="px-3 sm:px-5 py-3">Apr 2026 free trials</td>
                    <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(TIKTOK_2026.free_trials[3])}</td>
                    <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(INSTAGRAM_2026.free_trials[3])}</td>
                    <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(FACEBOOK_2026.free_trials[3])}</td></tr>
                <tr><td className="px-3 sm:px-5 py-3">Apr 2026 FTCR</td>
                    <td className="px-3 sm:px-5 py-3 text-right">{fmtPct(TIKTOK_2026.ftcr[3])}</td>
                    <td className="px-3 sm:px-5 py-3 text-right">{fmtPct(INSTAGRAM_2026.ftcr[3])}</td>
                    <td className="px-3 sm:px-5 py-3 text-right">{fmtPct(FACEBOOK_2026.ftcr[3])}</td></tr>
                <tr><td className="px-3 sm:px-5 py-3">Apr 2026 GA4 revenue</td>
                    <td className="px-3 sm:px-5 py-3 text-right text-[#62d070]">{fmtMoney(TIKTOK_2026.revenue_ga4[3])}</td>
                    <td className="px-3 sm:px-5 py-3 text-right text-[#62d070]">{fmtMoney(INSTAGRAM_2026.revenue_ga4[3])}</td>
                    <td className="px-3 sm:px-5 py-3 text-right text-[#62d070]">{fmtMoney(FACEBOOK_2026.revenue_ga4[3])}</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FOOTER STATUS */}
        <footer className="border-t border-[var(--border)] pt-6 sm:pt-8 pb-4 mt-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              ['TikTok', PLATFORM.tiktok.color, !!tt.data?.owned, 'Apify', tt.data?.fetched_at],
              ['Instagram', PLATFORM.instagram.color, !!ig.data?.owned, 'Apify', ig.data?.fetched_at],
              ['Facebook', PLATFORM.facebook.color, false, 'Meta API needed', null],
              ['Pinterest', PLATFORM.pinterest.color, !!pin.data?.profile, 'API v5', pin.data?.fetched_at],
            ].map(([name, color, ok, via, fetchedAt]) => (
              <div key={name} className="card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: ok ? '#62d070' : '#fad74f' }} />
                  <span className="text-xs font-semibold" style={{ color }}>{name}</span>
                </div>
                <div className="text-[10px] text-[var(--text-dim)] truncate">{ok ? via + ' · ' + timeAgo(fetchedAt) : via}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-dim)]">
            <span>Open-source dashboard · <a href="https://github.com/samcolibri/simplenursing-pulse" className="text-[#75c7e6] hover:underline" target="_blank" rel="noreferrer">samcolibri/simplenursing-pulse</a></span>
            <span>Excel verified · {VERIFIED_SOURCE.verified_at}</span>
          </div>
        </footer>
      </main>
    </div>
  )
}
