'use client'
import { useEffect, useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  INSTAGRAM_2026, FACEBOOK_2026, TIKTOK_2026,
} from '@/lib/excel-data'

const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
const fmtFull = (n) => n == null ? '—' : Number(n).toLocaleString()
const fmtPct = (n) => n == null ? '—' : (n * 100).toFixed(1) + '%'
const fmtMoney = (n) => n == null ? '—' : '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })
const timeAgo = (iso) => {
  if (!iso) return '—'
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return m + 'm ago'
  const h = Math.floor(m / 60); if (h < 24) return h + 'h ago'
  const d = Math.floor(h / 24); if (d < 7) return d + 'd ago'
  return Math.floor(d / 7) + 'w ago'
}



const PLATFORM = {
  tiktok:    { name: 'TikTok',    color: '#75c7e6', glow: 'glow-tt',  glyph: '🎵' },
  instagram: { name: 'Instagram', color: '#fc3467', glow: 'glow-ig',  glyph: '📷' },
  facebook:  { name: 'Facebook',  color: '#00709c', glow: 'glow-fb',  glyph: '📘' },
  pinterest: { name: 'Pinterest', color: '#e60036', glow: 'glow-pin', glyph: '📌' },
}

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
function useStaticData(file) {
  const [data, setData] = useState(null)
  useEffect(() => { fetch(base + '/data/' + file + '.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(setData).catch(() => {}) }, [file])
  return data
}

function SourceBadge({ label, color }) {
  return (
    <span className="mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border"
      style={{ color, borderColor: color + '50', background: color + '10' }}>
      {label}
    </span>
  )
}

// Standardised platform card — same 5 metrics for every platform
function PlatformCard({ platform, liveFollowers, liveSource, newFollowers, sessions, freeTrials, ftcr, revenue }) {
  const p = PLATFORM[platform]
  const metrics = [
    { label: 'New followers', value: fmtFull(newFollowers) },
    { label: 'GA4 sessions', value: fmtFull(sessions) },
    { label: 'Free trials', value: fmtFull(freeTrials) },
    { label: 'Trial conv. rate', value: fmtPct(ftcr) },
    { label: 'GA4 revenue', value: fmtMoney(revenue), green: true },
  ]
  return (
    <div className={'card-strong p-4 sm:p-5 fade-up ' + p.glow} style={{ borderColor: p.color + '40' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">{p.glyph}</span>
          <span className="text-sm font-bold tracking-tight">{p.name}</span>
        </div>
        {liveSource && <SourceBadge label={liveSource} color="#62d070" />}
      </div>
      {liveFollowers != null && (
        <div className="mb-3 pb-3 border-b border-[var(--border)]">
          <div className="num-xl text-2xl sm:text-3xl" style={{ color: p.color }}>{fmt(liveFollowers)}</div>
          <div className="text-[10px] text-[var(--text-dim)] mt-0.5 uppercase tracking-wide mono">Total followers · live</div>
        </div>
      )}
      <div className="space-y-2.5">
        {metrics.map(m => (
          <div key={m.label} className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">{m.label}</span>
            <span className={'text-xs font-semibold tabular-nums ' + (m.green ? 'text-[#62d070]' : '')}>{m.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-[var(--border)]">
        <span className="mono text-[9px] text-[var(--text-dim)]">Apr 2026 · Excel verified</span>
      </div>
    </div>
  )
}

// Pinterest-specific card — API provides impressions/saves/clicks but not trial/revenue
function PinterestCard({ pin }) {
  const p = PLATFORM.pinterest
  const metrics = pin ? [
    { label: 'Total followers', value: fmt(pin.profile?.follower_count) },
    { label: '30d impressions', value: fmt(pin.summary?.impressions) },
    { label: '30d saves', value: fmt(pin.summary?.saves) },
    { label: 'Outbound clicks', value: fmt(pin.summary?.outbound_clicks) },
    { label: 'Monthly views', value: fmt(pin.profile?.monthly_views) },
  ] : []
  return (
    <div className={'card-strong p-4 sm:p-5 fade-up ' + p.glow} style={{ borderColor: p.color + '40' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">{p.glyph}</span>
          <span className="text-sm font-bold">Pinterest</span>
        </div>
        {pin && <SourceBadge label="Pinterest API" color="#62d070" />}
      </div>
      {!pin && <div className="text-sm text-[var(--text-muted)]">Loading...</div>}
      {pin && (
        <>
          <div className="space-y-2.5">
            {metrics.map(m => (
              <div key={m.label} className="flex items-center justify-between">
                <span className="text-[11px] text-[var(--text-muted)]">{m.label}</span>
                <span className="text-xs font-semibold tabular-nums">{m.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-[var(--border)]">
            <span className="mono text-[9px] text-[var(--text-dim)]">Live · Pinterest API v5</span>
          </div>
        </>
      )}
    </div>
  )
}

// Known competitor display names
const COMP_DISPLAY = {
  'nurseinthemaking':   'Nurse In The Making',
  'registerednursern':  'RegisteredNurseRN',
  'yournursingeducator':'Your Nursing Educator',
  'archernursing':      'Archer Review',
  'uworld':             'UWorld',
  'nclexbootcamp':      'NCLEX Bootcamp',
  'nursingstudybyally': 'NursingStudyByAlly',
}

function PostRow({ post, isOwned }) {
  const platform = post.platform || 'tiktok'
  const p = PLATFORM[platform] || PLATFORM.tiktok
  const t = post.created_at || post.timestamp
  const views = post.views || post.likes || 0
  return (
    <a href={post.url} target="_blank" rel="noreferrer"
      className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 rounded-lg hover:bg-[var(--bg-card-2)] transition-colors group border border-transparent hover:border-[var(--border)]">
      <span className="mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 w-16 text-center"
        style={{ background: p.color + '20', color: p.color, border: '1px solid ' + p.color + '40' }}>
        {platform}
      </span>
      <span className="text-[11px] text-[var(--text-dim)] shrink-0 w-32 truncate">@{post.handle}</span>
      <span className="text-xs text-white/80 flex-1 truncate min-w-0">{post.caption || post.title || '(no caption)'}</span>
      <span className="num-xl text-sm font-semibold tabular-nums shrink-0" style={{ color: p.color }}>{fmt(views)}</span>
      <span className="mono text-[9px] uppercase text-[var(--text-dim)] shrink-0 hidden sm:inline">{post.views ? 'views' : 'likes'}</span>
      <span className="text-[10px] text-[var(--text-dim)] shrink-0 hidden sm:inline">{timeAgo(t)}</span>
      <span className="text-[var(--text-dim)] group-hover:text-white transition-colors shrink-0 text-xs">↗</span>
    </a>
  )
}

export default function PulsePage() {
  const tt = useStaticData('tiktok')
  const ig = useStaticData('instagram')
  const pin = useStaticData('pinterest')
  const insights = useStaticData('insights')
  const meta = useStaticData('last-updated')

  const [activeComp, setActiveComp] = useState(0)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [M, setM] = useState(3) // month index: 0=Jan … 3=Apr
  const [snapNote, setSnapNote] = useState('')

  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const MONTHS_WITH_DATA = useMemo(
    () => TIKTOK_2026.new_follows.reduce((acc, v, i) => { if (v != null) acc.push(i); return acc }, []),
    []
  )

  useEffect(() => {
    const saved = localStorage.getItem('sn-snap-note-' + M)
    setSnapNote(saved || '')
  }, [M])

  const handleNoteChange = (v) => {
    setSnapNote(v)
    localStorage.setItem('sn-snap-note-' + M, v)
  }
  const ourPosts = insights?.ours_top || []
  const competitorsByAccount = insights?.competitors_by_account || []

  const displayOurPosts = useMemo(() => {
    let posts = ourPosts
    if (dateFrom || dateTo) {
      posts = posts.filter(p => {
        const d = (p.created_at || p.timestamp || '').slice(0, 10)
        if (!d) return false
        if (dateFrom && d < dateFrom) return false
        if (dateTo && d > dateTo) return false
        return true
      })
    }
    return [...posts].sort((a, b) => (b.views || b.likes || 0) - (a.views || a.likes || 0))
  }, [ourPosts, dateFrom, dateTo])

  const displayCompPosts = useMemo(() => {
    const c = competitorsByAccount[activeComp]
    if (!c) return []
    let posts = c.top_posts || []
    if (dateFrom || dateTo) {
      posts = posts.filter(p => {
        const d = (p.created_at || p.timestamp || '').slice(0, 10)
        if (!d) return true // keep posts with no date
        if (dateFrom && d < dateFrom) return false
        if (dateTo && d > dateTo) return false
        return true
      })
    }
    return posts
  }, [competitorsByAccount, activeComp, dateFrom, dateTo])

  const hasDateFilter = dateFrom || dateTo

  const ourQuickStats = useMemo(() => {
    if (!displayOurPosts.length) return null
    const sorted = [...displayOurPosts].sort((a, b) => new Date(b.created_at || b.timestamp || 0) - new Date(a.created_at || a.timestamp || 0))
    return {
      count: displayOurPosts.length,
      bestViews: Math.max(...displayOurPosts.map(p => p.views || p.likes || 0)),
      latest: timeAgo(sorted[0]?.created_at || sorted[0]?.timestamp),
    }
  }, [displayOurPosts])

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">
        {/* HERO */}
        <section className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)]">
              {insights?.cutoff_date ? `Showing only posts since ${insights.cutoff_date}` : 'Live · auto-refreshed hourly'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
            What's happening<br/>
            <span className="bg-gradient-to-r from-[#75c7e6] via-[#fc3467] to-[#e60036] bg-clip-text text-transparent">at SimpleNursing right now.</span>
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-2xl">
            Last 30 days of posts, ranked by views. Refreshes every hour.
          </p>
        </section>

        {/* DATE RANGE FILTER */}
        <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4 card-strong rounded-xl">
          <span className="mono text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Filter posts by date</span>
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="bg-[var(--bg-card-2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#75c7e6]" />
            <span className="text-[var(--text-dim)] text-xs">to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="bg-[var(--bg-card-2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#75c7e6]" />
          </div>
          {hasDateFilter && (
            <button onClick={() => { setDateFrom(''); setDateTo('') }}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[#fc3467]/50 hover:text-[#fc3467] transition-all">
              Clear · show all 30 days
            </button>
          )}
          {hasDateFilter && (
            <span className="mono text-[10px] text-[#75c7e6]">
              {displayOurPosts.length} of {ourPosts.length} posts match
            </span>
          )}
        </div>

        {/* SECTION 1 — PLATFORM KPI CARDS */}
        <section>
          <div className="mb-4 sm:mb-5">
            <div className="mono text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">01 · platform performance</div>
            <h2 className="text-xl sm:text-2xl font-bold">Key metrics per platform</h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Each platform operates independently — standalone snapshots, not cross-platform comparisons</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <PlatformCard platform="tiktok" liveFollowers={tt?.owned?.followers} liveSource={tt?.owned ? 'LIVE · Apify' : null} newFollowers={TIKTOK_2026.new_follows[M]} sessions={TIKTOK_2026.sessions_ga4[M]} freeTrials={TIKTOK_2026.free_trials[M]} ftcr={TIKTOK_2026.ftcr[M]} revenue={TIKTOK_2026.revenue_ga4[M]} />
            <PlatformCard platform="instagram" liveFollowers={ig?.owned?.followers} liveSource={ig?.owned ? 'LIVE · Apify' : null} newFollowers={INSTAGRAM_2026.new_follows[M]} sessions={INSTAGRAM_2026.sessions[M]} freeTrials={INSTAGRAM_2026.free_trials[M]} ftcr={INSTAGRAM_2026.ftcr[M]} revenue={INSTAGRAM_2026.revenue_ga4[M]} />
            <PlatformCard platform="facebook" liveFollowers={null} liveSource={null} newFollowers={FACEBOOK_2026.new_follows[M]} sessions={FACEBOOK_2026.sessions_ga4[M]} freeTrials={FACEBOOK_2026.free_trials[M]} ftcr={FACEBOOK_2026.ftcr[M]} revenue={FACEBOOK_2026.revenue_ga4[M]} />
            <PinterestCard pin={pin} />
          </div>
        </section>

        {/* SECTION 2 — OUR RECENT POSTS */}
        <section>
          <div className="flex items-end justify-between mb-4 sm:mb-5 flex-wrap gap-2">
            <div>
              <div className="mono text-[10px] uppercase tracking-wider text-[#62d070] mb-1">02 · @simplenursing only</div>
              <h2 className="text-xl sm:text-2xl font-bold">Our recent posts — what we put out</h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">{displayOurPosts.length} posts{hasDateFilter ? ' in selected range' : ' in the last 30 days'} · highest views first</p>
            </div>
            <SourceBadge label="LIVE · Apify" color="#62d070" />
          </div>

          {displayOurPosts.length === 0 && (
            <div className="card-strong p-8 text-center">
              <div className="text-sm text-[var(--text-muted)]">{hasDateFilter ? 'No posts in that date range.' : 'No SimpleNursing posts found in the last 30 days.'}</div>
              <div className="text-xs text-[var(--text-dim)] mt-2">{hasDateFilter ? 'Try widening the date range.' : 'Hourly refresh will populate this after the next run.'}</div>
            </div>
          )}

          {displayOurPosts.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="card p-3 sm:p-4">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Posts last 30d</div>
                  <div className="num-xl text-xl sm:text-2xl">{ourQuickStats?.count}</div>
                </div>
                <div className="card p-3 sm:p-4">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Best post</div>
                  <div className="num-xl text-xl sm:text-2xl">{fmt(ourQuickStats?.bestViews)}</div>
                  <div className="text-[9px] text-[var(--text-dim)] mt-0.5">views</div>
                </div>
                <div className="card p-3 sm:p-4">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Latest post</div>
                  <div className="num-xl text-base sm:text-xl">{ourQuickStats?.latest}</div>
                </div>
              </div>
              <div className="card-strong rounded-xl divide-y divide-[var(--border)]/50">
                {displayOurPosts.slice(0, 20).map((p, i) => <PostRow key={p.id || i} post={p} isOwned={true} />)}
              </div>
            </>
          )}
        </section>

        {/* SECTION 3 — COMPETITOR WATCH (SEPARATE) */}
        <section>
          <div className="flex items-end justify-between mb-4 sm:mb-5 flex-wrap gap-2">
            <div>
              <div className="mono text-[10px] uppercase tracking-wider text-[#fad74f] mb-1">03 · competitor watch</div>
              <h2 className="text-xl sm:text-2xl font-bold">What the competition is doing</h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">{competitorsByAccount.length} accounts tracked · top 10 posts per account · ranked by velocity</p>
            </div>
            <SourceBadge label="LIVE · Apify" color="#fad74f" />
          </div>

          {competitorsByAccount.length === 0 && (
            <div className="card-strong p-8 text-center">
              <div className="text-sm text-[var(--text-muted)]">No competitor data yet.</div>
              <div className="text-xs text-[var(--text-dim)] mt-2">Hourly refresh will populate this after the next run.</div>
            </div>
          )}

          {competitorsByAccount.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {competitorsByAccount.map((c, i) => {
                  const name = COMP_DISPLAY[c.handle] || c.handle
                  return (
                    <button key={c.handle} onClick={() => setActiveComp(i)}
                      className={'text-xs px-3 py-1.5 rounded-full border transition-all ' + (activeComp === i ? 'bg-[#fad74f] text-black border-[#fad74f] font-semibold' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[#fad74f]/50')}>
                      {name}<span className="ml-1.5 opacity-60">{c.top_posts?.length || 0}</span>
                    </button>
                  )
                })}
              </div>
              {(() => {
                const c = competitorsByAccount[activeComp]
                if (!c) return null
                const name = COMP_DISPLAY[c.handle] || c.handle
                return (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-semibold">{name}</span>
                      {c.followers != null && <span className="mono text-[10px] text-[var(--text-dim)]">{fmtFull(c.followers)} followers</span>}
                      {hasDateFilter && <span className="mono text-[10px] text-[#75c7e6]">{displayCompPosts.length} posts in range</span>}
                    </div>
                    {displayCompPosts.length === 0
                      ? <div className="card-strong p-6 text-center text-sm text-[var(--text-muted)]">No posts in that date range for this account.</div>
                      : <div className="card-strong rounded-xl divide-y divide-[var(--border)]/50">
                          {displayCompPosts.map((p, idx) => <PostRow key={p.id || idx} post={p} isOwned={false} />)}
                        </div>
                    }
                  </div>
                )
              })()}
            </>
          )}
        </section>

        {/* SECTION 4 — PINTEREST 30-DAY */}
        {pin?.daily && (
          <section>
            <div className="mb-4 sm:mb-5">
              <div className="mono text-[10px] uppercase tracking-wider text-[#e60036] mb-1">04 · pinterest live</div>
              <h2 className="text-xl sm:text-2xl font-bold">Pinterest 30-day impression curve</h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                {pin?.summary?.period} · {fmt(pin?.summary?.impressions)} impressions · {fmt(pin?.summary?.saves)} saves · {fmt(pin?.summary?.outbound_clicks)} outbound clicks
              </p>
            </div>
            <div className="card-strong p-3 sm:p-5">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pin.daily.map(d => ({ date: d.date.slice(5), impressions: d.metrics?.IMPRESSION || 0, saves: d.metrics?.SAVE || 0 }))}>
                    <defs>
                      <linearGradient id="pinG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#e60036" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#e60036" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
                    <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 9 }} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={fmt} />
                    <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 11 }} formatter={(v) => fmtFull(v)} />
                    <Area type="monotone" dataKey="impressions" stroke="#e60036" strokeWidth={2.5} fill="url(#pinG)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}

        {/* TOPICS */}
        {insights?.topics && insights.topics.length > 0 && (
          <section>
            <div className="mb-4 sm:mb-5">
              <div className="mono text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">05 · last-30-day topic intelligence</div>
              <h2 className="text-xl sm:text-2xl font-bold">Trending Topics &amp; Areas This Month</h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Auto-clustered from broad nursing niche captions · ours + competitors + trending accounts</p>
            </div>
            <div className="card-strong p-5">
              <div className="space-y-3">
                {insights.topics.map(([topic, score], i) => {
                  const max = insights.topics[0][1]
                  return (
                    <div key={topic}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium">{topic}</span>
                        <span className="mono text-[10px] text-[var(--text-dim)]">{fmt(score)} aggregate velocity</span>
                      </div>
                      <div className="h-2.5 bg-[var(--bg-card-2)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(score / max) * 100}%`, background: i === 0 ? '#fc3467' : i < 3 ? '#fad74f' : '#75c7e6' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* BUSINESS SNAPSHOT — EXCEL */}
        <section>
          <div className="mb-4 sm:mb-5">
            <div className="mono text-[10px] uppercase tracking-wider text-[#75c7e6] mb-1">06 · business funnel snapshot</div>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl sm:text-2xl font-bold">Conversion + revenue snapshot</h2>
              <div className="flex gap-1.5 flex-wrap">
                {MONTHS_WITH_DATA.map(i => (
                  <button key={i} onClick={() => setM(i)}
                    className={'mono text-[10px] uppercase px-3 py-1.5 rounded-full border transition-all ' + (M === i ? 'bg-[#75c7e6] text-black border-[#75c7e6] font-bold' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[#75c7e6]/50')}>
                    {MONTH_LABELS[i]} 2026
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Excel verified · {MONTH_LABELS[M]} 2026</p>
          </div>
          <div className="card-strong overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-3 sm:px-5 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Metric</th>
                  <th className="text-right px-3 sm:px-5 py-3 text-[#75c7e6] mono text-[10px] uppercase">TikTok</th>
                  <th className="text-right px-3 sm:px-5 py-3 text-[#fc3467] mono text-[10px] uppercase">Instagram</th>
                  <th className="text-right px-3 sm:px-5 py-3 text-[#00709c] mono text-[10px] uppercase">Facebook</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                <tr>
                  <td className="px-3 sm:px-5 py-3 font-medium">New followers</td>
                  <td className="px-3 sm:px-5 py-3 text-right font-semibold">{fmtFull(TIKTOK_2026.new_follows[M])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right font-semibold">{fmtFull(INSTAGRAM_2026.new_follows[M])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right font-semibold">{fmtFull(FACEBOOK_2026.new_follows[M])}</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">GA4 sessions</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(TIKTOK_2026.sessions_ga4[M])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(INSTAGRAM_2026.sessions[M])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(FACEBOOK_2026.sessions_ga4[M])}</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">Free trials</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(TIKTOK_2026.free_trials[M])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(INSTAGRAM_2026.free_trials[M])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(FACEBOOK_2026.free_trials[M])}</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">FTCR</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtPct(TIKTOK_2026.ftcr[M])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtPct(INSTAGRAM_2026.ftcr[M])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtPct(FACEBOOK_2026.ftcr[M])}</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">GA4 revenue</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[#62d070]">{fmtMoney(TIKTOK_2026.revenue_ga4[M])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[#62d070]">{fmtMoney(INSTAGRAM_2026.revenue_ga4[M])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[#62d070]">{fmtMoney(FACEBOOK_2026.revenue_ga4[M])}</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">Views</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[var(--text-muted)]">{fmtFull(TIKTOK_2026.views[M])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[var(--text-muted)]">{fmtFull(INSTAGRAM_2026.total_views[M])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[var(--text-muted)]">{fmtFull(FACEBOOK_2026.views[M])}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4">
            <div className="mono text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-2">Team interpretation — {MONTH_LABELS[M]} 2026</div>
            <textarea
              value={snapNote}
              onChange={e => handleNoteChange(e.target.value)}
              placeholder={`Add your team's read on ${MONTH_LABELS[M]} performance here. What drove the numbers? What's the context leadership needs to know? Saved automatically per month.`}
              className="w-full bg-[var(--bg-card-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[#75c7e6]/50 resize-none leading-relaxed"
              rows={4}
            />
            {snapNote && <div className="mono text-[9px] text-[#62d070] mt-1.5">✓ Saved locally for {MONTH_LABELS[M]}</div>}
          </div>
        </section>
      </main>
    </div>
  )
}
