'use client'
import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, Cell } from 'recharts'
import {
  INSTAGRAM_2026, FACEBOOK_2026, TIKTOK_2026, YOUTUBE_2026,
  MONTHS, latestMonth,
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
const hoursSince = (iso) => iso ? Math.max(1, (Date.now() - new Date(iso).getTime()) / 3600000) : null
const fmtVelocity = (post) => {
  const t = post.created_at || post.timestamp
  const h = hoursSince(t)
  if (!h) return '—'
  const eng = (post.views || 0) + (post.likes || 0) * 10
  return fmt(eng / h) + '/hr'
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

function SourceTag({ source }) {
  const colors = {
    'apify-live': 'bg-[#62d070]/10 text-[#62d070] border-[#62d070]/30',
    'pinterest-api': 'bg-[#62d070]/10 text-[#62d070] border-[#62d070]/30',
    'xlsx': 'bg-[#75c7e6]/10 text-[#75c7e6] border-[#75c7e6]/30',
    'pending': 'bg-[#fad74f]/10 text-[#fad74f] border-[#fad74f]/30',
  }
  const labels = {
    'apify-live': 'LIVE · Apify',
    'pinterest-api': 'LIVE · Pinterest API',
    'xlsx': 'Excel · Apr 2026',
    'pending': 'Meta API pending',
  }
  return <span className={'mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ' + (colors[source] || '')}>{labels[source] || source}</span>
}

function PlatformCard({ platform, primary, secondary, tertiary, source }) {
  const p = PLATFORM[platform]
  return (
    <div className={'card-strong p-4 sm:p-5 ' + p.glow + ' fade-up'} style={{ borderColor: p.color + '40' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-lg sm:text-xl">{p.glyph}</span>
          <span className="text-sm font-semibold tracking-tight">{p.name}</span>
        </div>
        <SourceTag source={source} />
      </div>
      <div className="mb-3">
        <div className="num-xl text-2xl sm:text-3xl">{primary.value}</div>
        <div className="text-[11px] text-[var(--text-dim)] mt-0.5">{primary.label}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--border)]">
        <div>
          <div className="text-xs sm:text-sm font-semibold">{secondary.value}</div>
          <div className="text-[10px] uppercase tracking-wide text-[var(--text-dim)] mt-0.5 truncate">{secondary.label}</div>
        </div>
        <div>
          <div className="text-xs sm:text-sm font-semibold">{tertiary.value}</div>
          <div className="text-[10px] uppercase tracking-wide text-[var(--text-dim)] mt-0.5 truncate">{tertiary.label}</div>
        </div>
      </div>
    </div>
  )
}

function PostCard({ post, isOwned, showCompetitor }) {
  const p = PLATFORM[post.platform]
  const t = post.created_at || post.timestamp
  return (
    <a href={post.url} target="_blank" rel="noreferrer" className="block card overflow-hidden group hover:-translate-y-0.5 transition-all">
      <div className="aspect-[4/5] bg-[var(--bg-card-2)] relative overflow-hidden">
        {post.thumbnail ? (
          <img src={post.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
        ) : <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">{p.glyph}</div>}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1">
          <span className="mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded text-white" style={{ background: p.color }}>{post.platform}</span>
          {isOwned ? (
            <span className="mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#62d070] text-black">Ours</span>
          ) : showCompetitor && (
            <span className="mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#fad74f] text-black">Watch</span>
          )}
        </div>
        <div className="absolute top-2 left-2 mt-7">
          <span className="text-[9px] mono px-1.5 py-0.5 rounded bg-black/80 text-white">{timeAgo(t)}</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2.5 bg-gradient-to-t from-black/95 to-transparent">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="num-xl text-xl">{fmt(post.views || post.likes)}</div>
              <div className="text-[9px] text-white/70 uppercase mono">{post.views ? 'views' : 'likes'}</div>
            </div>
            <div className="text-right">
              <div className="num-xl text-sm text-[#75c7e6]">{fmtVelocity(post)}</div>
              <div className="text-[9px] text-white/60 uppercase mono">velocity</div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-[11px] leading-snug line-clamp-2 text-white/90 mb-1 min-h-[2rem]">{post.caption || post.title || '(no caption)'}</p>
        <div className="text-[10px] text-[var(--text-dim)] truncate">@{post.handle}</div>
      </div>
    </a>
  )
}

export default function PulsePage() {
  const tt = useStaticData('tiktok')
  const ig = useStaticData('instagram')
  const pin = useStaticData('pinterest')
  const insights = useStaticData('insights')
  const meta = useStaticData('last-updated')

  const ig_apr_reach = latestMonth(INSTAGRAM_2026.accounts_reached)
  const ig_apr_trials = latestMonth(INSTAGRAM_2026.free_trials)
  const fb_apr_views = latestMonth(FACEBOOK_2026.views)
  const fb_apr_reach = latestMonth(FACEBOOK_2026.accounts_reached)
  const fb_apr_trials = latestMonth(FACEBOOK_2026.free_trials)
  const tt_apr_views = latestMonth(TIKTOK_2026.views)
  const tt_apr_trials = latestMonth(TIKTOK_2026.free_trials)

  // SimpleNursing posts only — from filtered insights
  const ourPosts = insights?.ours_top || []
  // Competitor posts only
  const competitorPosts = insights?.competitor_top || []

  // Velocity metrics
  const ourVelocity = useMemo(() => {
    if (!ourPosts.length) return null
    const totalEng = ourPosts.reduce((s, p) => s + (p.score || 0), 0)
    return totalEng / ourPosts.length
  }, [ourPosts])

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
            Last 30 days of activity, ranked by velocity (engagement per hour). Refreshes every hour. No historical lifetime views skewing the feed.
          </p>
        </section>

        {/* PLATFORM HEROES */}
        <section>
          <div className="mb-4 sm:mb-5">
            <div className="mono text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">01 · Live platform overview</div>
            <h2 className="text-xl sm:text-2xl font-bold">Where we stand on each platform</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <PlatformCard
              platform="tiktok"
              source={tt?.owned ? 'apify-live' : 'pending'}
              primary={{ value: fmt(tt?.owned?.followers), label: 'Followers (live)' }}
              secondary={{ value: fmt(tt_apr_views?.value), label: 'Apr views' }}
              tertiary={{ value: fmtFull(tt_apr_trials?.value), label: 'Apr trials' }}
            />
            <PlatformCard
              platform="instagram"
              source={ig?.owned ? 'apify-live' : 'pending'}
              primary={{ value: fmt(ig?.owned?.followers), label: 'Followers (live)' }}
              secondary={{ value: fmt(ig_apr_reach?.value), label: 'Apr reach' }}
              tertiary={{ value: fmtFull(ig_apr_trials?.value), label: 'Apr trials' }}
            />
            <PlatformCard
              platform="facebook"
              source="xlsx"
              primary={{ value: fmt(fb_apr_views?.value), label: 'Apr views' }}
              secondary={{ value: fmt(fb_apr_reach?.value), label: 'Apr reach' }}
              tertiary={{ value: fmtFull(fb_apr_trials?.value), label: 'Apr trials' }}
            />
            <PlatformCard
              platform="pinterest"
              source={pin ? 'pinterest-api' : 'pending'}
              primary={{ value: fmt(pin?.profile?.monthly_views), label: 'Monthly views' }}
              secondary={{ value: fmt(pin?.summary?.impressions), label: '30d impressions' }}
              tertiary={{ value: fmt(pin?.summary?.saves), label: '30d saves' }}
            />
          </div>
        </section>

        {/* SECTION 2 — OUR RECENT WORK (ONLY SIMPLENURSING) */}
        <section>
          <div className="flex items-end justify-between mb-4 sm:mb-5 flex-wrap gap-2">
            <div>
              <div className="mono text-[10px] uppercase tracking-wider text-[#62d070] mb-1">02 · @simplenursing only</div>
              <h2 className="text-xl sm:text-2xl font-bold">Our recent posts — what we put out</h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">{ourPosts.length} posts in the last 30 days · ranked by velocity (engagement/hour)</p>
            </div>
            <div className="flex items-center gap-2">
              <SourceTag source="apify-live" />
            </div>
          </div>

          {ourPosts.length === 0 && (
            <div className="card-strong p-8 text-center">
              <div className="text-sm text-[var(--text-muted)]">No SimpleNursing posts found in the last 30 days from the live scrape.</div>
              <div className="text-xs text-[var(--text-dim)] mt-2">Hourly refresh will pick up new posts as they go live.</div>
            </div>
          )}

          {ourPosts.length > 0 && (
            <>
              {/* Our quick stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="card p-3 sm:p-4">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Posts last 30d</div>
                  <div className="num-xl text-xl sm:text-2xl">{ourPosts.length}</div>
                </div>
                <div className="card p-3 sm:p-4">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Best post</div>
                  <div className="num-xl text-xl sm:text-2xl">{fmt(ourPosts[0]?.views || ourPosts[0]?.likes)}</div>
                </div>
                <div className="card p-3 sm:p-4">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">Latest post</div>
                  <div className="num-xl text-base sm:text-xl">{timeAgo(ourPosts.slice().sort((a,b) => new Date(b.created_at||b.timestamp) - new Date(a.created_at||a.timestamp))[0]?.created_at || ourPosts[0]?.timestamp)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {ourPosts.slice(0, 8).map((p, i) => <PostCard key={i} post={p} isOwned={true} />)}
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
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">{competitorPosts.length} competitor posts in the last 30 days · ranked by velocity · totally separate from our content</p>
            </div>
            <SourceTag source="apify-live" />
          </div>

          {competitorPosts.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {competitorPosts.slice(0, 8).map((p, i) => <PostCard key={i} post={p} isOwned={false} showCompetitor={true} />)}
            </div>
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
              <h2 className="text-xl sm:text-2xl font-bold">What's winning in nursing content this month</h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Auto-clustered from live captions · combined ours + competitors</p>
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

        {/* APRIL BUSINESS SNAPSHOT — EXCEL */}
        <section>
          <div className="mb-4 sm:mb-5">
            <div className="mono text-[10px] uppercase tracking-wider text-[#75c7e6] mb-1">06 · april business funnel</div>
            <h2 className="text-xl sm:text-2xl font-bold">Conversion + revenue snapshot</h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Last verified month from Excel · TikTok had the trials peak in Feb (464), April collapsed to 52</p>
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
                  <td className="px-3 sm:px-5 py-3">Apr 2026 views</td>
                  <td className="px-3 sm:px-5 py-3 text-right font-semibold">{fmtFull(TIKTOK_2026.views[3])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right font-semibold">{fmtFull(INSTAGRAM_2026.total_views[3])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right font-semibold">{fmtFull(FACEBOOK_2026.views[3])}</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">Apr new follows</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(TIKTOK_2026.new_follows[3])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(INSTAGRAM_2026.new_follows[3])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(FACEBOOK_2026.new_follows[3])}</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">Apr free trials</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(TIKTOK_2026.free_trials[3])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(INSTAGRAM_2026.free_trials[3])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtFull(FACEBOOK_2026.free_trials[3])}</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">Apr FTCR</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtPct(TIKTOK_2026.ftcr[3])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtPct(INSTAGRAM_2026.ftcr[3])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right">{fmtPct(FACEBOOK_2026.ftcr[3])}</td>
                </tr>
                <tr>
                  <td className="px-3 sm:px-5 py-3">Apr GA4 revenue</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[#62d070]">{fmtMoney(TIKTOK_2026.revenue_ga4[3])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[#62d070]">{fmtMoney(INSTAGRAM_2026.revenue_ga4[3])}</td>
                  <td className="px-3 sm:px-5 py-3 text-right text-[#62d070]">{fmtMoney(FACEBOOK_2026.revenue_ga4[3])}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
