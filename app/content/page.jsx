'use client'
import { useEffect, useState, useMemo } from 'react'

const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
const fmtDate = (iso) => { if (!iso) return '—'; const d = new Date(iso); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }

const PLATFORM_COLOR = { tiktok: '#75c7e6', instagram: '#fc3467', pinterest: '#e60036' }

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
function useStaticData(file) {
  const [data, setData] = useState(null)
  useEffect(() => { fetch(base + '/data/' + file + '.json', { cache: 'no-store' }).then(r => r.json()).then(setData).catch(() => {}) }, [file])
  return data
}

export default function ContentPage() {
  const tt = useStaticData('tiktok')
  const ig = useStaticData('instagram')
  const pin = useStaticData('pinterest')

  const [platform, setPlatform] = useState('all')
  const [account, setAccount] = useState('all')
  const [sort, setSort] = useState('engagement')
  const [view, setView] = useState('grid')

  const allPosts = useMemo(() => {
    const out = []
    if (tt?.owned) for (const p of (tt.owned.recent_posts || [])) out.push({ platform: 'tiktok', isOwned: true, handle: tt.owned.handle, ...p })
    for (const c of (tt?.competitors || [])) for (const p of (c.recent_posts || [])) out.push({ platform: 'tiktok', isOwned: false, handle: c.handle, ...p })
    if (ig?.owned) for (const p of (ig.owned.recent_posts || [])) out.push({ platform: 'instagram', isOwned: true, handle: ig.owned.handle, ...p, views: p.video_views })
    for (const c of (ig?.competitors || [])) for (const p of (c.recent_posts || [])) out.push({ platform: 'instagram', isOwned: false, handle: c.handle, ...p, views: p.video_views })
    if (pin?.pins) for (const p of pin.pins) out.push({
      platform: 'pinterest', isOwned: true, handle: pin.profile?.username || 'simplenursing_official',
      caption: p.description || p.title, thumbnail: p.thumbnail, url: p.link, id: p.id,
      saves: null, likes: null, views: null,
      timestamp: p.created_at,
    })
    return out
  }, [tt, ig, pin])

  const filtered = useMemo(() => {
    let arr = allPosts
    if (platform !== 'all') arr = arr.filter(p => p.platform === platform)
    if (account === 'ours') arr = arr.filter(p => p.isOwned)
    if (account === 'competitors') arr = arr.filter(p => !p.isOwned)
    arr = [...arr].sort((a, b) => {
      if (sort === 'engagement') return ((b.views || 0) + (b.likes || 0) * 10) - ((a.views || 0) + (a.likes || 0) * 10)
      if (sort === 'views') return (b.views || 0) - (a.views || 0)
      if (sort === 'likes') return (b.likes || 0) - (a.likes || 0)
      if (sort === 'recent') return new Date(b.timestamp || b.created_at || 0).getTime() - new Date(a.timestamp || a.created_at || 0).getTime()
      return 0
    })
    return arr
  }, [allPosts, platform, account, sort])

  const stats = useMemo(() => ({
    total: allPosts.length,
    ours: allPosts.filter(p => p.isOwned).length,
    competitors: allPosts.filter(p => !p.isOwned).length,
    totalViews: allPosts.reduce((s, p) => s + (p.views || 0), 0),
  }), [allPosts])

  function exportCSV() {
    const rows = filtered.map(p => [
      p.platform, p.isOwned ? 'ours' : 'competitor', '@' + p.handle,
      '"' + (p.caption || '').replace(/"/g, '""').replace(/\n/g, ' ') + '"',
      p.views ?? '', p.likes ?? '', p.comments ?? '', p.shares ?? '', p.saves ?? '',
      p.url || '',
    ].join(','))
    const csv = ['platform,type,handle,caption,views,likes,comments,shares,saves,url', ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'simplenursing-posts.csv'; a.click()
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div>
        <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)] mb-2">All scraped content</div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Content library</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          {stats.total} posts from {stats.ours} our accounts + {stats.competitors} competitor posts · {fmt(stats.totalViews)} total views · live Apify + Pinterest API
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-3"><div className="text-xs text-[var(--text-dim)] mb-1">Total posts</div><div className="num-xl text-2xl">{stats.total}</div></div>
        <div className="card p-3"><div className="text-xs text-[var(--text-dim)] mb-1">Ours</div><div className="num-xl text-2xl text-[#62d070]">{stats.ours}</div></div>
        <div className="card p-3"><div className="text-xs text-[var(--text-dim)] mb-1">Competitors</div><div className="num-xl text-2xl text-[#fad74f]">{stats.competitors}</div></div>
        <div className="card p-3"><div className="text-xs text-[var(--text-dim)] mb-1">Combined views</div><div className="num-xl text-2xl">{fmt(stats.totalViews)}</div></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1.5">
          {['all', 'tiktok', 'instagram', 'pinterest'].map(p => {
            const color = PLATFORM_COLOR[p] || '#75c7e6'
            const active = platform === p
            return (
              <button key={p} onClick={() => setPlatform(p)}
                style={active ? { background: color + '18', borderColor: color + '55', color } : {}}
                className={'px-3 py-1.5 rounded-lg text-xs font-medium capitalize border ' + (active ? '' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)]')}>
                {p}
              </button>
            )
          })}
        </div>
        <div className="flex gap-1.5">
          {[['all', 'All'], ['ours', '✓ Ours'], ['competitors', '🔍 Competitors']].map(([v, l]) => (
            <button key={v} onClick={() => setAccount(v)}
              className={'px-3 py-1.5 rounded-lg text-xs font-medium border ' + (account === v ? 'bg-white/10 border-white/30 text-white' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)]')}>
              {l}
            </button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)} className="px-3 py-1.5 rounded-lg text-xs bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)]">
          <option value="engagement">Sort: Engagement</option>
          <option value="views">Sort: Views</option>
          <option value="likes">Sort: Likes</option>
          <option value="recent">Sort: Recent</option>
        </select>
        <div className="flex gap-1 ml-auto">
          <button onClick={() => setView('grid')} className={'px-2.5 py-1.5 rounded-lg text-xs border ' + (view === 'grid' ? 'bg-white/10 border-white/30' : 'bg-[var(--bg-card)] border-[var(--border)]')}>Grid</button>
          <button onClick={() => setView('table')} className={'px-2.5 py-1.5 rounded-lg text-xs border ' + (view === 'table' ? 'bg-white/10 border-white/30' : 'bg-[var(--bg-card)] border-[var(--border)]')}>Table</button>
          <button onClick={exportCSV} className="px-2.5 py-1.5 rounded-lg text-xs bg-[var(--bg-card)] border border-[var(--border)] text-[#62d070]">Export CSV</button>
        </div>
      </div>

      <div className="text-xs text-[var(--text-dim)]">{filtered.length} matching posts</div>

      {view === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((p, i) => {
            const color = PLATFORM_COLOR[p.platform] || '#75c7e6'
            return (
              <a key={i} href={p.url} target="_blank" rel="noreferrer" className="card overflow-hidden group hover:-translate-y-0.5 transition-all">
                <div className="aspect-[4/5] bg-[var(--bg-card-2)] relative overflow-hidden">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">📭</div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded text-white" style={{ background: color }}>{p.platform}</span>
                    {p.isOwned && <span className="mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#62d070] text-black">Ours</span>}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/95 to-transparent">
                    <div className="num-xl text-base text-white">{fmt(p.views || p.likes || p.saves)}</div>
                    <div className="text-[9px] text-white/70 uppercase mono">{p.views ? 'views' : p.likes ? 'likes' : 'saves'}</div>
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-[11px] leading-snug line-clamp-2 text-white/90 mb-1">{p.caption || '(no caption)'}</p>
                  <div className="text-[10px] text-[var(--text-dim)] truncate">@{p.handle}</div>
                </div>
              </a>
            )
          })}
        </div>
      )}

      {view === 'table' && (
        <div className="card-strong overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Platform</th>
                <th className="text-left px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Account</th>
                <th className="text-left px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Caption</th>
                <th className="text-right px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Views</th>
                <th className="text-right px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Likes</th>
                <th className="text-right px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Comments</th>
                <th className="text-right px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Shares</th>
                <th className="text-right px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/50">
              {filtered.map((p, i) => (
                <tr key={i} className="hover:bg-[var(--bg-card)]">
                  <td className="px-3 py-2.5">
                    <span className="mono text-[10px] uppercase px-1.5 py-0.5 rounded" style={{ background: (PLATFORM_COLOR[p.platform] || '#75c7e6') + '22', color: PLATFORM_COLOR[p.platform] || '#75c7e6' }}>{p.platform}</span>
                  </td>
                  <td className="px-3 py-2.5">{p.isOwned ? '✓ ' : ''}@{p.handle}</td>
                  <td className="px-3 py-2.5 max-w-md">
                    <a href={p.url} target="_blank" rel="noreferrer" className="text-[var(--text-muted)] hover:text-white line-clamp-1">{p.caption || '(no caption)'}</a>
                  </td>
                  <td className="px-3 py-2.5 text-right">{fmt(p.views)}</td>
                  <td className="px-3 py-2.5 text-right">{fmt(p.likes)}</td>
                  <td className="px-3 py-2.5 text-right">{fmt(p.comments)}</td>
                  <td className="px-3 py-2.5 text-right">{fmt(p.shares)}</td>
                  <td className="px-3 py-2.5 text-right text-[var(--text-dim)]">{fmtDate(p.timestamp || p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
