'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
function useStaticData(file) {
  const [data, setData] = useState(null)
  useEffect(() => { fetch(base + '/data/' + file + '.json', { cache: 'no-store' }).then(r => r.json()).then(setData).catch(() => {}) }, [file])
  return data
}

export default function TrendsPage() {
  const ttTrends = useStaticData('tiktok_trends')
  const igHashtags = useStaticData('ig_hashtags')
  const insights = useStaticData('insights')

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      <div>
        <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)] mb-2">Trending intelligence</div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Trends</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">Live from Apify TikTok search + IG hashtag scraper · auto-clustered from real captions</p>
      </div>

      {/* Topics */}
      {insights?.topics && (
        <section>
          <div className="text-sm font-semibold mb-3">Topic intelligence · what's winning in nursing content</div>
          <div className="card-strong p-5">
            <div className="space-y-3">
              {insights.topics.map(([topic, score], i) => {
                const max = insights.topics[0][1]
                return (
                  <div key={topic}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-medium">{topic}</span>
                      <span className="mono text-[10px] text-[var(--text-dim)]">{fmt(score)} aggregate engagement</span>
                    </div>
                    <div className="h-2.5 bg-[var(--bg-card-2)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(score / max) * 100}%`, background: i === 0 ? '#fc3467' : i < 3 ? '#fad74f' : '#75c7e6' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* TikTok hashtags */}
      {ttTrends?.hashtags && (
        <section>
          <div className="text-sm font-semibold mb-3">TikTok hashtag velocity · top 15</div>
          <div className="card-strong p-3 sm:p-5">
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ttTrends.hashtags.slice(0, 15)} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={fmt} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} width={110} tickFormatter={(v) => '#' + v} />
                  <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 11 }} formatter={(v) => fmt(v) + ' aggregate views'} cursor={{ fill: '#ffffff08' }} />
                  <Bar dataKey="total_views" fill="#75c7e6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* TikTok sounds */}
      {ttTrends?.sounds && (
        <section>
          <div className="text-sm font-semibold mb-3">Trending TikTok sounds · gaining velocity in nursing</div>
          <div className="card-strong p-2">
            <div className="space-y-1">
              {ttTrends.sounds.slice(0, 15).map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--bg-card-2)]">
                  <div className="mono text-xs text-[var(--text-dim)] w-6">{i + 1}</div>
                  <div className="text-xl">🎵</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{s.name}</div>
                    <div className="text-[11px] text-[var(--text-dim)] truncate">{s.author || '—'} · used {s.uses}× in nursing search</div>
                  </div>
                  <div className="text-sm font-semibold mono text-[#75c7e6]">{fmt(s.total_views)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending posts */}
      {ttTrends?.trending_posts && ttTrends.trending_posts.length > 0 && (
        <section>
          <div className="text-sm font-semibold mb-3">High-velocity nursing posts · last few days · 100K+ views</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ttTrends.trending_posts.slice(0, 12).map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noreferrer" className="card overflow-hidden group">
                <div className="aspect-[4/5] bg-[var(--bg-card-2)] relative">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                  ) : <div className="w-full h-full flex items-center justify-center opacity-30 text-2xl">🎵</div>}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/95 to-transparent">
                    <div className="num-xl text-base">{fmt(p.views)}</div>
                    <div className="text-[10px] text-white/70 uppercase mono">views</div>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-[11px] line-clamp-2">{p.caption}</p>
                  <div className="text-[10px] text-[var(--text-dim)] truncate mt-1">@{p.author}</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
