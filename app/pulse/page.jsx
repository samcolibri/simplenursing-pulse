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
const ymd = (iso) => !iso ? '' : String(iso).slice(0, 10)
const fmtDate = (iso) => {
  const d = ymd(iso)
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${MONTHS[Number(m) - 1]} ${Number(day)}, ${y}`
}
const fmtDateShort = (iso) => {
  const d = ymd(iso)
  if (!d) return '—'
  const [, m, day] = d.split('-')
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${MONTHS[Number(m) - 1]} ${Number(day)}`
}

const inRange = (iso, from, to) => {
  const d = ymd(iso)
  if (!d) return false
  if (from && d < from) return false
  if (to && d > to) return false
  return true
}

const PLATFORM = {
  tiktok:    { name: 'TikTok',    color: '#75c7e6', glow: 'glow-tt',  glyph: '🎵' },
  instagram: { name: 'Instagram', color: '#fc3467', glow: 'glow-ig',  glyph: '📷' },
  facebook:  { name: 'Facebook',  color: '#00709c', glow: 'glow-fb',  glyph: '📘' },
  pinterest: { name: 'Pinterest', color: '#e60036', glow: 'glow-pin', glyph: '📌' },
  youtube:   { name: 'YouTube',   color: '#ff0000', glow: 'glow-yt',  glyph: '▶' },
}

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
function useStaticData(file) {
  const [data, setData] = useState(null)
  useEffect(() => { fetch(base + '/data/' + file + '.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(setData).catch(() => {}) }, [file])
  return data
}

function PipelineHealth({ meta }) {
  if (!meta?.platforms) return null
  const failing = Object.entries(meta.platforms)
    .filter(([, v]) => v && v.ok === false)
    .map(([k, v]) => ({ key: k, reason: v.reason || 'unknown error' }))
  if (failing.length === 0) return null
  const fetchedAgo = (() => {
    if (!meta.fetched_at) return null
    const m = Math.floor((Date.now() - new Date(meta.fetched_at).getTime()) / 60000)
    if (m < 60) return m + 'm'
    const h = Math.floor(m / 60); if (h < 24) return h + 'h'
    return Math.floor(h / 24) + 'd'
  })()
  return (
    <div className="rounded-xl border border-[#fc3467]/40 bg-[#fc3467]/10 p-4 sm:p-5 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#fc3467] text-white">Pipeline degraded</span>
        <span className="text-xs text-[var(--text-muted)]">
          {failing.length} source{failing.length > 1 ? 's' : ''} failing · last refresh {fetchedAgo} ago
        </span>
      </div>
      <ul className="text-[11px] text-[var(--text-muted)] space-y-1 font-mono">
        {failing.map(f => (
          <li key={f.key}>
            <span className="text-white">{f.key}</span>: {String(f.reason).split('\n')[0].slice(0, 160)}
          </li>
        ))}
      </ul>
      <div className="text-[11px] text-[var(--text-muted)] pt-1">
        Data shown below is from the most recent successful scrape and will not reflect anything posted since then. Resolve the source(s) above to restore freshness.
      </div>
    </div>
  )
}

function SourceBadge({ label, color }) {
  return (
    <span className="mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border"
      style={{ color, borderColor: color + '50', background: color + '10' }}>
      {label}
    </span>
  )
}

function PlatformCard({ platform, liveFollowers, liveSource, posts, topPost, excelFallback }) {
  const p = PLATFORM[platform]
  const totalViews = posts.reduce((s, x) => s + (x.views || x.video_views || x.likes || 0), 0)
  const avgViews = posts.length ? totalViews / posts.length : 0
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
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-muted)]">Posts in range</span>
          <span className="text-xs font-semibold tabular-nums">{fmtFull(posts.length)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-muted)]">Total views</span>
          <span className="text-xs font-semibold tabular-nums">{fmt(totalViews)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-muted)]">Avg per post</span>
          <span className="text-xs font-semibold tabular-nums">{fmt(avgViews)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-muted)]">Top post</span>
          <span className="text-xs font-semibold tabular-nums" style={{ color: p.color }}>{topPost ? fmt(topPost.views || topPost.likes || 0) : '—'}</span>
        </div>
        {excelFallback && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">{excelFallback.label}</span>
            <span className="text-xs font-semibold tabular-nums text-[#62d070]">{excelFallback.value}</span>
          </div>
        )}
      </div>
      <div className="mt-3 pt-2 border-t border-[var(--border)]">
        <span className="mono text-[9px] text-[var(--text-dim)]">
          {posts.length ? `Latest: ${fmtDateShort(posts[0]?.created_at || posts[0]?.timestamp)}` : 'No posts in selected range'}
        </span>
      </div>
    </div>
  )
}

function PinterestCard({ pin, from, to }) {
  const p = PLATFORM.pinterest
  const daily = (pin?.daily || []).filter(d => inRange(d.date, from, to))
  const totals = daily.reduce((acc, d) => {
    acc.imp += d.metrics?.IMPRESSION || 0
    acc.save += d.metrics?.SAVE || 0
    acc.click += d.metrics?.PIN_CLICK || 0
    acc.outbound += d.metrics?.OUTBOUND_CLICK || 0
    return acc
  }, { imp: 0, save: 0, click: 0, outbound: 0 })
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
          <div className="mb-3 pb-3 border-b border-[var(--border)]">
            <div className="num-xl text-2xl sm:text-3xl" style={{ color: p.color }}>{fmt(pin.profile?.follower_count)}</div>
            <div className="text-[10px] text-[var(--text-dim)] mt-0.5 uppercase tracking-wide mono">Total followers · live</div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-muted)]">Days in range</span>
              <span className="text-xs font-semibold tabular-nums">{daily.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-muted)]">Impressions</span>
              <span className="text-xs font-semibold tabular-nums">{fmt(totals.imp)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-muted)]">Saves</span>
              <span className="text-xs font-semibold tabular-nums">{fmt(totals.save)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-muted)]">Outbound clicks</span>
              <span className="text-xs font-semibold tabular-nums">{fmt(totals.outbound)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[var(--text-muted)]">Monthly views</span>
              <span className="text-xs font-semibold tabular-nums">{fmt(pin.profile?.monthly_views)}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[var(--border)]">
            <span className="mono text-[9px] text-[var(--text-dim)]">
              {daily.length ? `Pinterest API v5 · ${daily.length} day window` : 'No daily data in selected range'}
            </span>
          </div>
        </>
      )}
    </div>
  )
}

const COMP_DISPLAY = {
  'nurseinthemaking':   'Nurse In The Making',
  'registerednursern':  'RegisteredNurseRN',
  'yournursingeducator':'Your Nursing Educator',
  'archernursing':      'Archer Review',
  'uworld':             'UWorld',
  'nclexbootcamp':      'NCLEX Bootcamp',
  'nursingstudybyally': 'NursingStudyByAlly',
}

function PostRow({ post }) {
  const platform = post.platform || 'tiktok'
  const p = PLATFORM[platform] || PLATFORM.tiktok
  const t = post.created_at || post.timestamp || post.published_at
  const views = post.views || post.video_views || post.likes || 0
  return (
    <a href={post.url} target="_blank" rel="noreferrer" title={`Verify on ${p.name} — opens the original post in a new tab`}
      className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 rounded-lg hover:bg-[var(--bg-card-2)] transition-colors group border border-transparent hover:border-[var(--border)]">
      <span className="mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 w-16 text-center"
        style={{ background: p.color + '20', color: p.color, border: '1px solid ' + p.color + '40' }}>
        {platform}
      </span>
      <span className="text-[11px] text-[var(--text-dim)] shrink-0 w-32 truncate">@{post.handle}</span>
      <span className="text-xs text-white/80 flex-1 truncate min-w-0">{post.caption || post.title || '(no caption)'}</span>
      <span className="num-xl text-sm font-semibold tabular-nums shrink-0" style={{ color: p.color }}>{fmt(views)}</span>
      <span className="mono text-[9px] uppercase text-[var(--text-dim)] shrink-0 hidden sm:inline">{post.views || post.video_views ? 'views' : 'likes'}</span>
      <span className="mono text-[10px] text-[var(--text-dim)] shrink-0 hidden sm:inline tabular-nums">{fmtDateShort(t)}</span>
      <span className="mono text-[9px] uppercase font-semibold text-[var(--text-dim)] group-hover:text-[#75c7e6] transition-colors shrink-0 hidden md:inline tabular-nums tracking-wider">verify ↗</span>
    </a>
  )
}

function defaultRange(meta) {
  const today = new Date()
  const end = meta?.fetched_at ? new Date(meta.fetched_at) : today
  const start = new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000)
  const iso = (d) => d.toISOString().slice(0, 10)
  return { from: iso(start), to: iso(today) }
}

// Next Monday at 12:00 UTC — used in the hero to advertise the next refresh.
function nextMondayLabel() {
  const now = new Date()
  const day = now.getUTCDay() // 0=Sun, 1=Mon, ...
  const hour = now.getUTCHours()
  // If today is Monday and we haven't hit 12:00 UTC yet, today is the next refresh
  let daysAhead = (1 - day + 7) % 7
  if (day === 1 && hour < 12) daysAhead = 0
  if (daysAhead === 0 && hour >= 12) daysAhead = 7
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysAhead, 12, 0, 0))
  return fmtDate(next.toISOString())
}

const MONTHS_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December']

function excelRowForRange(EXCEL, from, to) {
  if (!from || !to) return null
  if (from.slice(0, 7) !== to.slice(0, 7)) return null
  const monthIdx = Number(from.slice(5, 7)) - 1
  if (monthIdx < 0 || monthIdx > 11) return null
  const newFollows = EXCEL.new_follows?.[monthIdx]
  const sessions  = EXCEL.sessions_ga4?.[monthIdx] ?? EXCEL.sessions?.[monthIdx]
  const freeTrials = EXCEL.free_trials?.[monthIdx]
  const ftcr = EXCEL.ftcr?.[monthIdx]
  const revenue = EXCEL.revenue_ga4?.[monthIdx]
  if (newFollows == null && sessions == null && freeTrials == null && revenue == null) return null
  return { newFollows, sessions, freeTrials, ftcr, revenue, month: monthIdx }
}

export default function PulsePage() {
  const tt = useStaticData('tiktok')
  const ig = useStaticData('instagram')
  const pin = useStaticData('pinterest')
  const yt = useStaticData('youtube')
  const insights = useStaticData('insights')
  const meta = useStaticData('last-updated')

  const [activeComp, setActiveComp] = useState(0)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [snapNote, setSnapNote] = useState('')

  useEffect(() => {
    if (meta && !dateFrom && !dateTo) {
      const r = defaultRange(meta)
      setDateFrom(r.from)
      setDateTo(r.to)
    }
  }, [meta]) // eslint-disable-line react-hooks/exhaustive-deps

  const noteKey = dateFrom && dateTo ? `sn-note-${dateFrom}_${dateTo}` : null
  useEffect(() => {
    if (!noteKey) return
    setSnapNote(localStorage.getItem(noteKey) || '')
  }, [noteKey])

  const handleNoteChange = (v) => {
    setSnapNote(v)
    if (noteKey) localStorage.setItem(noteKey, v)
  }

  const ourPosts = insights?.ours_top || []
  const competitorsByAccount = insights?.competitors_by_account || []

  const ourPostsInRange = useMemo(() =>
    ourPosts
      .filter(p => inRange(p.created_at || p.timestamp, dateFrom, dateTo))
      .sort((a, b) => (b.views || b.likes || 0) - (a.views || a.likes || 0)),
    [ourPosts, dateFrom, dateTo]
  )

  const compPostsInRange = useMemo(() => {
    const c = competitorsByAccount[activeComp]
    if (!c) return []
    return (c.top_posts || []).filter(p => inRange(p.created_at || p.timestamp, dateFrom, dateTo))
  }, [competitorsByAccount, activeComp, dateFrom, dateTo])

  const ytVideosInRange = useMemo(() =>
    (yt?.videos || []).filter(v => inRange(v.published_at || v.created_at || v.timestamp, dateFrom, dateTo)),
    [yt, dateFrom, dateTo]
  )

  const ttOurs = useMemo(() => ourPosts.filter(p => p.platform === 'tiktok' && inRange(p.created_at || p.timestamp, dateFrom, dateTo)), [ourPosts, dateFrom, dateTo])
  const igOurs = useMemo(() => ourPosts.filter(p => p.platform === 'instagram' && inRange(p.created_at || p.timestamp, dateFrom, dateTo)), [ourPosts, dateFrom, dateTo])

  const ttTop = ttOurs[0]
  const igTop = igOurs[0]
  const fbOurs = []
  const fbTop = null

  const ttExcel = excelRowForRange(TIKTOK_2026, dateFrom, dateTo)
  const igExcel = excelRowForRange(INSTAGRAM_2026, dateFrom, dateTo)
  const fbExcel = excelRowForRange(FACEBOOK_2026, dateFrom, dateTo)

  const applyPreset = (preset) => {
    const today = new Date()
    const iso = (d) => d.toISOString().slice(0, 10)
    let from, to
    if (preset === '7d') {
      to = iso(today); from = iso(new Date(today.getTime() - 6 * 86400000))
    } else if (preset === '30d') {
      to = iso(today); from = iso(new Date(today.getTime() - 29 * 86400000))
    } else if (preset === 'this-month') {
      from = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`
      to = iso(today)
    } else if (preset === 'last-month') {
      const y = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear()
      const m = today.getMonth() === 0 ? 12 : today.getMonth()
      const lastDay = new Date(y, m, 0).getDate()
      from = `${y}-${String(m).padStart(2, '0')}-01`
      to = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
    } else if (preset === 'ytd') {
      from = `${today.getFullYear()}-01-01`; to = iso(today)
    }
    setDateFrom(from); setDateTo(to)
  }

  const rangeLabel = dateFrom && dateTo ? `${fmtDate(dateFrom)} → ${fmtDate(dateTo)}` : 'All time'

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-10">
        <section className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)]">
              {meta?.fetched_at ? `Last hard refresh: ${fmtDate(meta.fetched_at)} ${new Date(meta.fetched_at).toUTCString().slice(17, 22)} UTC` : 'Awaiting first refresh'}
            </span>
            <span className="mono text-[10px] uppercase tracking-widest text-[#75c7e6]">
              · next: {nextMondayLabel()}
            </span>
            <span className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)]">
              · cadence: weekly · Mondays 12:00 UTC
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
            What is happening<br/>
            <span className="bg-gradient-to-r from-[#75c7e6] via-[#fc3467] to-[#e60036] bg-clip-text text-transparent">at SimpleNursing this week.</span>
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-2xl">
            One date range controls everything below. Every post links straight back to its native page — click any row to verify the numbers against the source.
          </p>
        </section>

        <PipelineHealth meta={meta} />

        <section className="card-strong rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)] mb-1">date range · drives every section</div>
              <div className="text-base sm:text-lg font-semibold">{rangeLabel}</div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: '7d', label: 'Last 7d' },
                { id: '30d', label: 'Last 30d' },
                { id: 'this-month', label: 'This month' },
                { id: 'last-month', label: 'Last month' },
                { id: 'ytd', label: 'YTD' },
              ].map(p => (
                <button key={p.id} onClick={() => applyPreset(p.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:border-[#75c7e6]/50 hover:text-white transition-all">
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mono text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Custom</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="bg-[var(--bg-card-2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#75c7e6]" />
            <span className="text-[var(--text-dim)] text-xs">to</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="bg-[var(--bg-card-2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#75c7e6]" />
            {insights?.cutoff_date && dateFrom && dateFrom < insights.cutoff_date && (
              <span className="mono text-[10px] text-[#fad74f]">
                ⚠ Earliest data: {insights.cutoff_date} (scrape window). Older posts will not appear until window widens.
              </span>
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 sm:mb-5">
            <div className="mono text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">01 · platform performance · in selected range</div>
            <h2 className="text-xl sm:text-2xl font-bold">Key metrics per platform</h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">All four cards reflect {rangeLabel}. Excel-verified GA4 stats overlay only when the range is exactly one verified month.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <PlatformCard
              platform="tiktok"
              liveFollowers={tt?.owned?.followers}
              liveSource={tt?.owned ? 'LIVE · Apify' : null}
              posts={ttOurs}
              topPost={ttTop}
              excelFallback={ttExcel ? { label: `GA4 revenue (${MONTHS_FULL[ttExcel.month]})`, value: fmtMoney(ttExcel.revenue) } : null}
            />
            <PlatformCard
              platform="instagram"
              liveFollowers={ig?.owned?.followers}
              liveSource={ig?.owned ? 'LIVE · Apify' : null}
              posts={igOurs}
              topPost={igTop}
              excelFallback={igExcel ? { label: `GA4 revenue (${MONTHS_FULL[igExcel.month]})`, value: fmtMoney(igExcel.revenue) } : null}
            />
            <PlatformCard
              platform="facebook"
              liveFollowers={null}
              liveSource={null}
              posts={fbOurs}
              topPost={fbTop}
              excelFallback={fbExcel ? { label: `GA4 revenue (${MONTHS_FULL[fbExcel.month]})`, value: fmtMoney(fbExcel.revenue) } : null}
            />
            <PinterestCard pin={pin} from={dateFrom} to={dateTo} />
          </div>
        </section>

        <section>
          <div className="flex items-end justify-between mb-4 sm:mb-5 flex-wrap gap-2">
            <div>
              <div className="mono text-[10px] uppercase tracking-wider text-[#62d070] mb-1">02 · @simplenursing only</div>
              <h2 className="text-xl sm:text-2xl font-bold">Our posts in this range</h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                {ourPostsInRange.length} post{ourPostsInRange.length === 1 ? '' : 's'} between {fmtDate(dateFrom)} and {fmtDate(dateTo)} · highest views first
              </p>
            </div>
            <SourceBadge label="LIVE · Apify + YouTube" color="#62d070" />
          </div>

          {ourPostsInRange.length === 0 && (
            <div className="card-strong p-8 text-center">
              <div className="text-sm text-[var(--text-muted)]">No SimpleNursing posts in this range.</div>
              <div className="text-xs text-[var(--text-dim)] mt-2">Try widening the range or check the pipeline status above.</div>
            </div>
          )}

          {ourPostsInRange.length > 0 && (
            <div className="card-strong rounded-xl divide-y divide-[var(--border)]/50">
              {ourPostsInRange.map((p, i) => <PostRow key={p.id || i} post={p} />)}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-end justify-between mb-4 sm:mb-5 flex-wrap gap-2">
            <div>
              <div className="mono text-[10px] uppercase tracking-wider text-[#fad74f] mb-1">03 · competitor watch</div>
              <h2 className="text-xl sm:text-2xl font-bold">What the competition is doing</h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">{competitorsByAccount.length} accounts tracked · filtered to {rangeLabel}</p>
            </div>
            <SourceBadge label="LIVE · Apify" color="#fad74f" />
          </div>

          {competitorsByAccount.length === 0 && (
            <div className="card-strong p-8 text-center">
              <div className="text-sm text-[var(--text-muted)]">No competitor data yet.</div>
            </div>
          )}

          {competitorsByAccount.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {competitorsByAccount.map((c, i) => {
                  const name = COMP_DISPLAY[c.handle] || c.handle
                  const inRangeCount = (c.top_posts || []).filter(p => inRange(p.created_at || p.timestamp, dateFrom, dateTo)).length
                  return (
                    <button key={c.handle} onClick={() => setActiveComp(i)}
                      className={'text-xs px-3 py-1.5 rounded-full border transition-all ' + (activeComp === i ? 'bg-[#fad74f] text-black border-[#fad74f] font-semibold' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[#fad74f]/50')}>
                      {name}<span className="ml-1.5 opacity-60">{inRangeCount}</span>
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
                      <span className="mono text-[10px] text-[#75c7e6]">{compPostsInRange.length} posts in range</span>
                    </div>
                    {compPostsInRange.length === 0
                      ? <div className="card-strong p-6 text-center text-sm text-[var(--text-muted)]">No posts in this range for this account.</div>
                      : <div className="card-strong rounded-xl divide-y divide-[var(--border)]/50">
                          {compPostsInRange.map((p, idx) => <PostRow key={p.id || idx} post={p} />)}
                        </div>
                    }
                  </div>
                )
              })()}
            </>
          )}
        </section>

        {pin?.daily && (
          <section>
            <div className="mb-4 sm:mb-5">
              <div className="mono text-[10px] uppercase tracking-wider text-[#e60036] mb-1">04 · pinterest live</div>
              <h2 className="text-xl sm:text-2xl font-bold">Pinterest impression curve</h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">{rangeLabel}</p>
            </div>
            {(() => {
              const filtered = pin.daily.filter(d => inRange(d.date, dateFrom, dateTo))
              if (filtered.length === 0) {
                return <div className="card-strong p-8 text-center text-sm text-[var(--text-muted)]">No Pinterest daily data in this range. (Pinterest API only returns the last ~30 days.)</div>
              }
              return (
                <div className="card-strong p-3 sm:p-5">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filtered.map(d => ({ date: d.date.slice(5), impressions: d.metrics?.IMPRESSION || 0, saves: d.metrics?.SAVE || 0 }))}>
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
              )
            })()}
          </section>
        )}

        {yt && (
          <section>
            <div className="flex items-end justify-between mb-4 sm:mb-5 flex-wrap gap-2">
              <div>
                <div className="mono text-[10px] uppercase tracking-wider mb-1" style={{ color: '#ff0000' }}>05 · youtube</div>
                <h2 className="text-xl sm:text-2xl font-bold">YouTube in this range</h2>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                  {ytVideosInRange.length} video{ytVideosInRange.length === 1 ? '' : 's'} between {fmtDate(dateFrom)} and {fmtDate(dateTo)}
                  {yt.channel ? ` · ${fmtFull(yt.channel.subscribers)} subscribers` : ''}
                </p>
              </div>
              <SourceBadge label="YouTube Data API" color="#ff0000" />
            </div>

            {ytVideosInRange.length === 0 && (
              <div className="card-strong p-8 text-center">
                <div className="text-sm text-[var(--text-muted)]">No YouTube videos in this range.</div>
              </div>
            )}

            {ytVideosInRange.length > 0 && (
              <div className="card-strong rounded-xl divide-y divide-[var(--border)]/50">
                {ytVideosInRange.map((v, i) => <PostRow key={v.id || i} post={{ ...v, platform: 'youtube', handle: 'simplenursing', created_at: v.published_at || v.created_at }} />)}
              </div>
            )}
          </section>
        )}

        {insights?.topics && insights.topics.length > 0 && (
          <section>
            <div className="mb-4 sm:mb-5">
              <div className="mono text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">06 · topic intelligence · scrape window</div>
              <h2 className="text-xl sm:text-2xl font-bold">Trending topics this scrape window</h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                Auto-clustered from broad nursing niche captions across our posts, competitors, and trending accounts ·
                {insights.days_back ? ` last ${insights.days_back} days` : ''}
                <span className="ml-2 mono text-[10px] text-[var(--text-dim)]">(not affected by date filter — clustering happens at scrape time)</span>
              </p>
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

        <section>
          <div className="mb-4 sm:mb-5">
            <div className="mono text-[10px] uppercase tracking-wider text-[#75c7e6] mb-1">07 · business funnel snapshot</div>
            <h2 className="text-xl sm:text-2xl font-bold">Performance + revenue snapshot</h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              {rangeLabel}. Live columns (posts, views) come from the scrape · GA4 revenue overlays when the range matches a verified month.
            </p>
          </div>
          <div className="card-strong overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-3 sm:px-5 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Metric</th>
                  <th className="text-right px-3 sm:px-5 py-3 text-[#75c7e6] mono text-[10px] uppercase">TikTok</th>
                  <th className="text-right px-3 sm:px-5 py-3 text-[#fc3467] mono text-[10px] uppercase">Instagram</th>
                  <th className="text-right px-3 sm:px-5 py-3 text-[#00709c] mono text-[10px] uppercase">Facebook</th>
                  <th className="text-right px-3 sm:px-5 py-3 text-[#ff0000] mono text-[10px] uppercase">YouTube</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50">
                <tr>
                  <td className="px-3 sm:px-5 py-3 font-medium">Posts in range</td>
                  <td className="px-3 sm:px-5 py-3 text-right font-semibold">{fmtFull(ttOurs.length)}</td>
                  <td className="px-3 sm:px-5 py-3 text-right font-semibold">{fmtFull(igOurs.length)}</td>
                  <td className="px-3 sm:px-5 py-3 text-right font-semibold">{fmtFull(fbOurs.length)}</td>
                  <td className="px-3 sm:px-5 py-3 text-right font-semibold">{fmtFull(ytVideosInRange.length)}</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">Total views</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmt(ttOurs.reduce((s, x) => s + (x.views || 0), 0))}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmt(igOurs.reduce((s, x) => s + (x.video_views || x.likes || 0), 0))}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[var(--text-dim)]">—</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmt(ytVideosInRange.reduce((s, x) => s + (x.views || 0), 0))}</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">Avg views / post</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmt(ttOurs.length ? ttOurs.reduce((s, x) => s + (x.views || 0), 0) / ttOurs.length : 0)}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmt(igOurs.length ? igOurs.reduce((s, x) => s + (x.video_views || x.likes || 0), 0) / igOurs.length : 0)}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[var(--text-dim)]">—</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmt(ytVideosInRange.length ? ytVideosInRange.reduce((s, x) => s + (x.views || 0), 0) / ytVideosInRange.length : 0)}</td>
                </tr>
                <tr className="bg-[var(--bg-card-2)]/30">
                  <td className="px-3 sm:px-5 py-3 font-medium" colSpan={5}>
                    <span className="mono text-[10px] uppercase tracking-wider text-[var(--text-dim)]">GA4 — Excel verified · overlays when range is exactly one verified month</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">New followers</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{ttExcel ? fmtFull(ttExcel.newFollows) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{igExcel ? fmtFull(igExcel.newFollows) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fbExcel ? fmtFull(fbExcel.newFollows) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[var(--text-dim)]">—</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">GA4 sessions</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{ttExcel ? fmtFull(ttExcel.sessions) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{igExcel ? fmtFull(igExcel.sessions) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fbExcel ? fmtFull(fbExcel.sessions) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[var(--text-dim)]">—</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">Free trials</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{ttExcel ? fmtFull(ttExcel.freeTrials) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{igExcel ? fmtFull(igExcel.freeTrials) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fbExcel ? fmtFull(fbExcel.freeTrials) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[var(--text-dim)]">—</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">FTCR</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{ttExcel?.ftcr != null ? fmtPct(ttExcel.ftcr) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{igExcel?.ftcr != null ? fmtPct(igExcel.ftcr) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fbExcel?.ftcr != null ? fmtPct(fbExcel.ftcr) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[var(--text-dim)]">—</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">GA4 revenue</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[#62d070]">{ttExcel ? fmtMoney(ttExcel.revenue) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[#62d070]">{igExcel ? fmtMoney(igExcel.revenue) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[#62d070]">{fbExcel ? fmtMoney(fbExcel.revenue) : <span className="text-[var(--text-dim)]">—</span>}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[var(--text-dim)]">—</td>
                </tr>
              </tbody>
            </table>
          </div>
          {(!ttExcel && !igExcel && !fbExcel) && (
            <div className="mt-3 mono text-[10px] text-[var(--text-dim)]">
              GA4 columns show only when the range exactly matches an Excel-verified month (Jan–Apr 2026). For May, June and beyond, wire a GA4 export so live GA4 metrics can populate automatically.
            </div>
          )}
          <div className="mt-4">
            <div className="mono text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-2">Team interpretation — {rangeLabel}</div>
            <textarea
              value={snapNote}
              onChange={e => handleNoteChange(e.target.value)}
              placeholder={`Add the team read for this range. What drove the numbers? What context does leadership need? Saved automatically per range.`}
              className="w-full bg-[var(--bg-card-2)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[#75c7e6]/50 resize-none leading-relaxed"
              rows={4}
            />
            {snapNote && <div className="mono text-[9px] text-[#62d070] mt-1.5">✓ Saved locally</div>}
          </div>
        </section>

        {/* DATA INTEGRITY — how this is trustworthy */}
        <section>
          <div className="mb-4 sm:mb-5">
            <div className="mono text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">08 · data integrity</div>
            <h2 className="text-xl sm:text-2xl font-bold">How we know this is real</h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Every number on this page comes from a public API or scrape of the native platform · click any post row to open the original and compare in one tap.
            </p>
          </div>
          <div className="card-strong p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#75c7e6]/30 bg-[#75c7e6]/5 p-3">
                <div className="mono text-[9px] uppercase tracking-wider text-[#75c7e6] mb-1">TikTok + Instagram</div>
                <div className="text-xs text-white/90 leading-relaxed">
                  Scraped via <span className="mono text-[#75c7e6]">Apify</span> (clockworks/tiktok-scraper + apify/instagram-profile-scraper) — the industry-standard public-page scrapers. View / like / comment counts read straight from the native page DOM at scrape time.
                </div>
              </div>
              <div className="rounded-lg border border-[#e60036]/30 bg-[#e60036]/5 p-3">
                <div className="mono text-[9px] uppercase tracking-wider text-[#e60036] mb-1">Pinterest</div>
                <div className="text-xs text-white/90 leading-relaxed">
                  <span className="mono text-[#e60036]">Pinterest API v5</span> — first-party endpoint authenticated with our brand token. Impressions, saves and outbound clicks come from the same source Pinterest Analytics shows internally.
                </div>
              </div>
              <div className="rounded-lg border border-[#ff0000]/30 bg-[#ff0000]/5 p-3">
                <div className="mono text-[9px] uppercase tracking-wider" style={{color:'#ff0000'}}>YouTube</div>
                <div className="text-xs text-white/90 leading-relaxed">
                  <span className="mono" style={{color:'#ff0000'}}>YouTube Data API v3</span> — first-party Google endpoint. Subscriber, view and engagement counts match YouTube Studio at fetch time.
                </div>
              </div>
              <div className="rounded-lg border border-[#62d070]/30 bg-[#62d070]/5 p-3">
                <div className="mono text-[9px] uppercase tracking-wider text-[#62d070] mb-1">GA4 funnel (Excel)</div>
                <div className="text-xs text-white/90 leading-relaxed">
                  New followers, sessions, free trials, FTCR and revenue for verified months come from the audited 2026 Social Performance Tracker spreadsheet, transcribed from Google Analytics 4. Future months overlay automatically once GA4 export is wired.
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card-2)] p-3">
              <div className="mono text-[9px] uppercase tracking-wider text-[var(--text-dim)] mb-2">Refresh cadence</div>
              <ul className="text-xs text-white/90 space-y-1.5 leading-relaxed">
                <li>· <span className="font-semibold">Weekly hard refresh</span> every Monday at 12:00 UTC. All five sources fire together so every section on this page reflects the same point-in-time snapshot.</li>
                <li>· Last hard refresh: <span className="mono text-[#75c7e6]">{meta?.fetched_at ? new Date(meta.fetched_at).toUTCString() : 'pending'}</span></li>
                <li>· Next scheduled refresh: <span className="mono text-[#75c7e6]">{nextMondayLabel()} 12:00 UTC</span></li>
                <li>· Off-cycle refresh: trigger <span className="mono">refresh-data.yml</span> from GitHub Actions when needed.</li>
              </ul>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card-2)] p-3">
              <div className="mono text-[9px] uppercase tracking-wider text-[var(--text-dim)] mb-2">Spot-check it yourself</div>
              <ol className="text-xs text-white/90 space-y-1.5 leading-relaxed list-decimal list-inside">
                <li>Click any post row above. It opens the original on TikTok / Instagram / YouTube / Pinterest in a new tab.</li>
                <li>Compare the view / like / save count to what you see here. They should match within minutes of the refresh timestamp.</li>
                <li>If a number looks off, note the timestamp — view counts on the native platform continue updating between our weekly refreshes. Trigger an off-cycle refresh to reconcile.</li>
              </ol>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
