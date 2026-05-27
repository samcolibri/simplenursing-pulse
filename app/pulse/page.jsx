'use client'
import { useEffect, useMemo, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, Users, Eye, Heart, Zap, Bell, Pin, MessageCircle, Share2, Bookmark, AlertCircle, RefreshCw, Flame, Sparkles } from 'lucide-react'

const fmt = (n) => n > 0 ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n) : '0'
const fmtFull = (n) => (n ?? 0).toLocaleString()
const timeAgo = (iso) => {
  if (!iso) return '—'
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return m + 'm ago'
  const h = Math.floor(m / 60); if (h < 24) return h + 'h ago'
  return Math.floor(h / 24) + 'd ago'
}

const PLATFORM = {
  tiktok:    { name: 'TikTok',    color: '#75c7e6', glyph: '🎵' },
  instagram: { name: 'Instagram', color: '#fc3467', glyph: '📷' },
  facebook:  { name: 'Facebook',  color: '#00709c', glyph: '📘' },
  pinterest: { name: 'Pinterest', color: '#e60036', glyph: '📌' },
}

// Excel-derived baseline: 2026 monthly performance (Jan-Apr) — for YoY chart
const EXCEL_MONTHLY = [
  { month: 'Jan', tiktok: 16057347, instagram: 6083475, facebook: 12816129, tiktok_25: 5391309, instagram_25: 0, facebook_25: 0 },
  { month: 'Feb', tiktok: 17222661, instagram: 5621747, facebook: 7760649,  tiktok_25: 7492585, instagram_25: 0, facebook_25: 0 },
  { month: 'Mar', tiktok: 12398586, instagram: 3603150, facebook: 12580793, tiktok_25: 7944426, instagram_25: 0, facebook_25: 0 },
  { month: 'Apr', tiktok: 12296014, instagram: 4239995, facebook: 7074880,  tiktok_25: 5348693, instagram_25: 0, facebook_25: 0 },
]

const EXCEL_LATEST = {
  tiktok:    { views: 12296014, free_trials: 248, ftcr: 0.020, revenue: 281,   new_follows: 8500,  shares: 5300 },
  instagram: { reach: 1664455,  views: 4239995,  free_trials: 89,  new_follows: 12500, shares: 5300 },
  facebook:  { views: 7074880,  follower_views: 0.158, non_follower: 0.842, new_followers: 0 },
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

function PlatformHero({ platform, primary, secondary, tertiary, status }) {
  const p = PLATFORM[platform]
  return (
    <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-5 hover:border-opacity-50 transition-all" style={{ borderColor: p.color + '33' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{p.glyph}</span>
          <span className="text-sm font-semibold text-white">{p.name}</span>
        </div>
        {status === 'live' && <span className="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider" style={{ background: p.color + '22', color: p.color }}>LIVE</span>}
        {status === 'pending' && <span className="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider bg-[#fad74f]/20 text-[#fad74f]">PENDING</span>}
      </div>
      <div className="mb-2">
        <div className="text-3xl font-bold text-white">{primary.value}</div>
        <div className="text-xs text-gray-500 mt-0.5">{primary.label}</div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#1e2433]">
        <div>
          <div className="text-sm font-semibold text-white">{secondary.value}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">{secondary.label}</div>
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{tertiary.value}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wide">{tertiary.label}</div>
        </div>
      </div>
    </div>
  )
}

export default function PulsePage() {
  const tt = useStaticData('tiktok')
  const ig = useStaticData('instagram')
  const pin = useStaticData('pinterest')
  const meta = useStaticData('last-updated')

  const allLiveAt = meta.data?.fetched_at

  // top-line numbers per platform
  const ttData = tt.data
  const igData = ig.data
  const pinData = pin.data

  // compute top viral posts across competitors
  const viralPosts = useMemo(() => {
    const all = []
    if (ttData?.competitors) {
      for (const c of ttData.competitors) {
        for (const p of c.recent_posts || []) {
          all.push({ platform: 'tiktok', handle: c.handle, ...p, score: p.views || 0, primary: p.views, primaryLabel: 'views' })
        }
      }
    }
    if (ttData?.owned) {
      for (const p of ttData.owned.recent_posts || []) {
        all.push({ platform: 'tiktok', handle: ttData.owned.handle, isOwned: true, ...p, score: p.views || 0, primary: p.views, primaryLabel: 'views' })
      }
    }
    if (igData?.competitors) {
      for (const c of igData.competitors) {
        for (const p of c.recent_posts || []) {
          all.push({ platform: 'instagram', handle: c.handle, ...p, score: p.likes || 0, primary: p.likes, primaryLabel: 'likes' })
        }
      }
    }
    if (igData?.owned) {
      for (const p of igData.owned.recent_posts || []) {
        all.push({ platform: 'instagram', handle: igData.owned.handle, isOwned: true, ...p, score: p.likes || 0, primary: p.likes, primaryLabel: 'likes' })
      }
    }
    return all.sort((a, b) => b.score - a.score).slice(0, 8)
  }, [ttData, igData])

  // Topic clustering from viral posts
  const topicClusters = useMemo(() => {
    const TOPICS = {
      'NCLEX': /nclex|boards|exam|test/i,
      'ECG/Cardiac': /ecg|ekg|heart|cardiac|rhythm/i,
      'Pharm': /pharm|medication|drug|med|nclex pharm/i,
      'Lab Values': /lab|electrolyte|panel|sodium|potassium/i,
      'Clinical': /clinical|skill|injection|iv|cath/i,
      'New Grad': /new grad|first year|residency|nurse|tip/i,
      'Humor': /humor|funny|joke|haha|lol/i,
    }
    const counts = {}
    for (const post of viralPosts) {
      for (const [topic, rx] of Object.entries(TOPICS)) {
        if (rx.test(post.caption || '')) {
          counts[topic] = (counts[topic] || 0) + (post.score / 1000)
          break
        }
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6)
  }, [viralPosts])

  const competitorFollowers = useMemo(() => {
    const data = []
    if (ttData?.owned) data.push({ name: 'SN TikTok', followers: ttData.owned.followers, platform: 'tiktok', owned: true })
    for (const c of ttData?.competitors || []) data.push({ name: c.display_name || c.handle, followers: c.followers, platform: 'tiktok', owned: false })
    if (igData?.owned) data.push({ name: 'SN Instagram', followers: igData.owned.followers, platform: 'instagram', owned: true })
    for (const c of igData?.competitors || []) data.push({ name: c.display_name || c.handle, followers: c.followers, platform: 'instagram', owned: false })
    return data.sort((a, b) => b.followers - a.followers)
  }, [ttData, igData])

  const loading = tt.loading || ig.loading || pin.loading

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">SimpleNursing Pulse</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time social intelligence across all platforms · Auto-refreshes hourly via GitHub Actions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d1117] border border-[#1e2433] rounded-lg">
            <span className="w-2 h-2 rounded-full bg-[#62d070] live-dot"></span>
            <span className="text-xs text-gray-400">Last refresh: <span className="text-white font-medium">{timeAgo(allLiveAt)}</span></span>
          </div>
        </div>
      </div>

      {/* PLATFORM HERO — all 4 in one row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <PlatformHero
          platform="tiktok"
          status={ttData?.owned ? 'live' : 'loading'}
          primary={{ value: fmt(ttData?.owned?.followers ?? EXCEL_LATEST.tiktok.views), label: ttData?.owned ? 'Followers (live)' : 'Apr views (Excel)' }}
          secondary={{ value: fmt(EXCEL_LATEST.tiktok.views), label: 'Apr Views' }}
          tertiary={{ value: ttData?.owned?.posts ? fmt(ttData.owned.posts) : '—', label: 'Posts' }}
        />
        <PlatformHero
          platform="instagram"
          status={igData?.owned ? 'live' : 'loading'}
          primary={{ value: fmt(igData?.owned?.followers ?? 862531), label: igData?.owned ? 'Followers (live)' : 'Followers' }}
          secondary={{ value: fmt(EXCEL_LATEST.instagram.reach), label: 'Apr Reach' }}
          tertiary={{ value: fmt(igData?.owned?.posts ?? 0), label: 'Posts' }}
        />
        <PlatformHero
          platform="facebook"
          status="pending"
          primary={{ value: fmt(EXCEL_LATEST.facebook.views), label: 'Apr Views (Excel)' }}
          secondary={{ value: Math.round(EXCEL_LATEST.facebook.non_follower * 100) + '%', label: 'Non-follower' }}
          tertiary={{ value: 'Meta API', label: 'Required' }}
        />
        <PlatformHero
          platform="pinterest"
          status={pinData ? 'live' : 'loading'}
          primary={{ value: fmt(pinData?.profile?.monthly_views ?? 148882), label: 'Monthly views (live)' }}
          secondary={{ value: fmt(pinData?.summary?.impressions ?? 144717), label: '30d Impressions' }}
          tertiary={{ value: fmt(pinData?.summary?.saves ?? 699), label: '30d Saves' }}
        />
      </div>

      {/* WHAT'S WORKING — viral feed */}
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Flame size={16} className="text-[#fc3467]" /> What's Working Today
          </h2>
          <span className="text-xs text-gray-500">Top 8 posts ranked by reach · refreshed hourly</span>
        </div>

        {loading && <div className="text-center text-gray-500 py-8">Loading live posts…</div>}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {viralPosts.map((post, i) => {
              const p = PLATFORM[post.platform]
              return (
                <a key={i} href={post.url} target="_blank" rel="noreferrer" className="block bg-[#161b22] border border-[#1e2433] rounded-lg overflow-hidden hover:border-opacity-50 transition-all" style={{ borderColor: p.color + (post.isOwned ? '66' : '22') }}>
                  {post.thumbnail && (
                    <div className="aspect-video bg-[#0a0a0f] relative overflow-hidden">
                      <img src={post.thumbnail} alt="" className="w-full h-full object-cover opacity-90" referrerPolicy="no-referrer" />
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style={{ background: p.color, color: '#fff' }}>{post.platform}</span>
                      {post.isOwned && <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#62d070] text-[9px] font-bold text-black">OURS</span>}
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs text-white line-clamp-2 mb-2 min-h-[2.5rem]">{post.caption || post.title || '(no caption)'}</p>
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span>@{post.handle}</span>
                      <span className="text-white font-semibold">{fmt(post.primary)} {post.primaryLabel}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                      {post.likes > 0 && <span className="flex items-center gap-0.5"><Heart size={9}/> {fmt(post.likes)}</span>}
                      {post.comments > 0 && <span className="flex items-center gap-0.5"><MessageCircle size={9}/> {fmt(post.comments)}</span>}
                      {post.shares > 0 && <span className="flex items-center gap-0.5"><Share2 size={9}/> {fmt(post.shares)}</span>}
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>

      {/* TWO COLUMN: Competitive gap + Topic clusters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#0d1117] border border-[#1e2433] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Users size={14} /> Competitive Follower Gap (live from Apify)
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={competitorFollowers} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={fmt} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} width={140} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1e2433', fontSize: 11 }} formatter={(v) => fmtFull(v)} />
              <Bar dataKey="followers" radius={[0, 3, 3, 0]}>
                {competitorFollowers.map((d, i) => (
                  <Bar key={i} fill={d.owned ? PLATFORM[d.platform].color : PLATFORM[d.platform].color + '66'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2">Solid bars = SimpleNursing · Translucent = competitors. NurseInTheMaking now leads both IG and TT.</p>
        </div>

        <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Sparkles size={14} className="text-[#fad74f]" /> Trending Topics
          </h2>
          <p className="text-xs text-gray-500 mb-3">Auto-extracted from top viral posts</p>
          <div className="space-y-2">
            {topicClusters.length === 0 && <p className="text-xs text-gray-600">Crunching live captions…</p>}
            {topicClusters.map(([topic, score], i) => {
              const max = topicClusters[0]?.[1] || 1
              return (
                <div key={topic}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white">{topic}</span>
                    <span className="text-[10px] text-gray-500">{Math.round(score)}k engagement</span>
                  </div>
                  <div className="h-1.5 bg-[#1e2433] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(score / max) * 100}%`, background: i === 0 ? '#fc3467' : i < 3 ? '#fad74f' : '#75c7e6' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* YoY view trend (Excel data) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Monthly Views — 2026 (from Excel tracker)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={EXCEL_MONTHLY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={fmt} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1e2433', fontSize: 11 }} formatter={(v) => fmtFull(v)} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="tiktok" stroke="#75c7e6" strokeWidth={2} name="TikTok" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="instagram" stroke="#fc3467" strokeWidth={2} name="Instagram" dot={{ r: 3 }} />
              <Line type="monotone" dataKey="facebook" stroke="#00709c" strokeWidth={2} name="Facebook" dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Pin size={14} className="text-[#e60036]" /> Pinterest 30-day Trend
          </h2>
          {pinData?.daily ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={pinData.daily.map(d => ({ date: d.date.slice(5), impressions: d.metrics?.IMPRESSION || 0, saves: d.metrics?.SAVE || 0, clicks: d.metrics?.PIN_CLICK || 0 }))}>
                <defs>
                  <linearGradient id="impGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e60036" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#e60036" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 9 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={fmt} />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1e2433', fontSize: 11 }} formatter={(v) => fmtFull(v)} />
                <Area type="monotone" dataKey="impressions" stroke="#e60036" strokeWidth={2} fill="url(#impGrad)" name="Impressions" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="text-xs text-gray-600 py-8 text-center">Loading…</div>}
          {pinData?.summary && (
            <p className="text-xs text-gray-500 mt-2">
              {pinData.summary.period} · {fmt(pinData.summary.pin_clicks)} pin clicks · {fmt(pinData.summary.outbound_clicks)} outbound · {fmt(pinData.summary.saves)} saves
            </p>
          )}
        </div>
      </div>

      {/* Status footer */}
      <div className="bg-[#0a0f1a] border border-[#1e2433] rounded-xl p-4">
        <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3">Platform connections</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <ConnectionStatus name="TikTok"    via="Apify" ok={!!ttData?.owned} live={ttData?.fetched_at} />
          <ConnectionStatus name="Instagram" via="Apify" ok={!!igData?.owned} live={igData?.fetched_at} />
          <ConnectionStatus name="Facebook"  via="Meta API" ok={false} note="App ID + Business token required" />
          <ConnectionStatus name="Pinterest" via="API v5" ok={!!pinData?.profile} live={pinData?.fetched_at} />
        </div>
        <p className="text-[10px] text-gray-600 mt-3">Data refreshed hourly via GitHub Actions cron (.github/workflows/refresh-data.yml). Built static, served from GitHub Pages.</p>
      </div>
    </div>
  )
}

function ConnectionStatus({ name, via, ok, live, note }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-[#62d070] live-dot' : 'bg-[#fad74f]'}`} />
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium">{name}</div>
        <div className="text-[10px] text-gray-500 truncate">{ok ? `${via} · ${timeAgo(live)}` : note || via}</div>
      </div>
    </div>
  )
}
