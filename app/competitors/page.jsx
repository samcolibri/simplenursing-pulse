'use client'
import { useEffect, useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
const fmtFull = (n) => n == null ? '—' : Number(n).toLocaleString()

const PLATFORM_COLOR = { tiktok: '#75c7e6', instagram: '#fc3467' }
const PLATFORM_GLYPH = { tiktok: '🎵', instagram: '📷' }

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
function useStaticData(file) {
  const [data, setData] = useState(null)
  useEffect(() => { fetch(base + '/data/' + file + '.json', { cache: 'no-store' }).then(r => r.json()).then(setData).catch(() => {}) }, [file])
  return data
}

function timeAgo(iso) {
  if (!iso) return '—'
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return m + 'm ago'
  return Math.floor(m / 60) + 'h ago'
}

function CompetitorCard({ competitor, ours, platform }) {
  const color = PLATFORM_COLOR[platform]
  const gap = ours ? competitor.followers - ours.followers : 0
  const gapPct = ours && ours.followers ? (gap / ours.followers) * 100 : 0
  const topPost = competitor.recent_posts?.[0]

  return (
    <div className="card-strong overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 mb-4">
          {competitor.avatar ? (
            <img src={competitor.avatar} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[var(--bg-card-2)] flex items-center justify-center text-xl shrink-0">{PLATFORM_GLYPH[platform]}</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold truncate">@{competitor.handle}</span>
              {competitor.verified && <span className="text-[#75c7e6] text-sm">✓</span>}
              <span className="mono text-[9px] uppercase px-1.5 py-0.5 rounded" style={{ background: color + '22', color }}>{platform}</span>
            </div>
            <div className="text-xs text-[var(--text-muted)] truncate">{competitor.display_name}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <div className="num-xl text-xl">{fmt(competitor.followers)}</div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Followers</div>
          </div>
          <div>
            <div className="num-xl text-xl">{fmt(competitor.posts)}</div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Posts</div>
          </div>
          <div>
            <div className={'num-xl text-xl ' + (gap > 0 ? 'text-[#fc3467]' : 'text-[#62d070]')}>
              {gap > 0 ? '+' : ''}{fmt(gap)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">vs us {gap > 0 ? '↑' : '↓'}</div>
          </div>
        </div>

        {competitor.bio && (
          <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 mb-3 border-t border-[var(--border)] pt-3">{competitor.bio}</p>
        )}
      </div>

      {/* Recent posts grid */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5">
        <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-2">Recent posts · top by engagement</div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
          {(competitor.recent_posts || []).slice(0, 8).map((p, i) => (
            <a key={i} href={p.url} target="_blank" rel="noreferrer" className="block aspect-square rounded-md overflow-hidden bg-[var(--bg-card-2)] relative group">
              {p.thumbnail ? (
                <img src={p.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-all" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-30">{PLATFORM_GLYPH[platform]}</div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/95 to-transparent">
                <div className="text-[10px] text-white font-bold leading-none">{fmt(p.views || p.likes)}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CompetitorsPage() {
  const tt = useStaticData('tiktok')
  const ig = useStaticData('instagram')

  const allAccounts = useMemo(() => {
    const out = []
    for (const c of (tt?.competitors || [])) out.push({ ...c, platform: 'tiktok' })
    for (const c of (ig?.competitors || [])) out.push({ ...c, platform: 'instagram' })
    return out.sort((a, b) => b.followers - a.followers)
  }, [tt, ig])

  const gapChart = useMemo(() => {
    const out = []
    if (tt?.owned) out.push({ name: 'SN · TT', followers: tt.owned.followers, platform: 'tiktok', owned: true })
    for (const c of (tt?.competitors || [])) out.push({ name: c.handle + ' · TT', followers: c.followers, platform: 'tiktok', owned: false })
    if (ig?.owned) out.push({ name: 'SN · IG', followers: ig.owned.followers, platform: 'instagram', owned: true })
    for (const c of (ig?.competitors || [])) out.push({ name: c.handle + ' · IG', followers: c.followers, platform: 'instagram', owned: false })
    return out.sort((a, b) => b.followers - a.followers)
  }, [tt, ig])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      <div>
        <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)] mb-2">Live competitor monitoring</div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Competitors</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          {allAccounts.length} accounts scraped live via Apify · refreshed every hour ·
          {' '}<span className="text-white font-medium">{timeAgo(tt?.fetched_at || ig?.fetched_at)}</span> ago
        </p>
      </div>

      {/* Big follower gap chart */}
      <section>
        <div className="text-sm font-semibold mb-3">Follower ladder · live</div>
        <div className="card-strong p-3 sm:p-5">
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapChart} layout="vertical" margin={{ left: 0, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={fmt} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} width={130} />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 11 }} formatter={(v) => [fmtFull(v) + ' followers', '']} cursor={{ fill: '#ffffff08' }} />
                <Bar dataKey="followers" radius={[0, 4, 4, 0]}>
                  {gapChart.map((d, i) => <Cell key={i} fill={d.owned ? PLATFORM_COLOR[d.platform] : PLATFORM_COLOR[d.platform] + '55'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Per-competitor cards */}
      <section>
        <div className="text-sm font-semibold mb-3">Individual competitor deep dive</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {allAccounts.map((c, i) => (
            <CompetitorCard
              key={c.handle + c.platform}
              competitor={c}
              ours={c.platform === 'tiktok' ? tt?.owned : ig?.owned}
              platform={c.platform}
            />
          ))}
        </div>
      </section>

      {/* Combined leaderboard table */}
      <section>
        <div className="text-sm font-semibold mb-3">Engagement leaderboard · top recent posts across all competitors</div>
        <div className="card-strong overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Account</th>
                <th className="text-left px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Platform</th>
                <th className="text-left px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Caption</th>
                <th className="text-right px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Views</th>
                <th className="text-right px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Likes</th>
                <th className="text-right px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">ER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {allAccounts.flatMap(c =>
                (c.recent_posts || []).slice(0, 3).map(p => ({ ...p, handle: c.handle, platform: c.platform }))
              ).sort((a, b) => (b.views || b.likes * 10) - (a.views || a.likes * 10)).slice(0, 20).map((p, i) => {
                const er = p.views && p.likes ? (p.likes / p.views) * 100 : null
                return (
                  <tr key={i} className="hover:bg-[var(--bg-card)]">
                    <td className="px-3 py-2.5 font-medium">@{p.handle}</td>
                    <td className="px-3 py-2.5">
                      <span className="mono text-[10px] uppercase px-1.5 py-0.5 rounded" style={{ background: PLATFORM_COLOR[p.platform] + '22', color: PLATFORM_COLOR[p.platform] }}>{p.platform}</span>
                    </td>
                    <td className="px-3 py-2.5 max-w-xs">
                      <a href={p.url} target="_blank" rel="noreferrer" className="text-[var(--text-muted)] hover:text-white line-clamp-1">
                        {p.caption || '(no caption)'}
                      </a>
                    </td>
                    <td className="px-3 py-2.5 text-right">{fmt(p.views)}</td>
                    <td className="px-3 py-2.5 text-right">{fmt(p.likes)}</td>
                    <td className="px-3 py-2.5 text-right text-[#62d070]">{er ? er.toFixed(1) + '%' : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
