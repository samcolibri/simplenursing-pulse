'use client'
import { SEED_MONTHLY_METRICS, COMPETITOR_SEED, TRENDING_HASHTAGS_SEED, AI_RECOMMENDATIONS_SEED } from '@/lib/data'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Users, Eye, MousePointer, Zap, Bell, Lightbulb } from 'lucide-react'

const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
const fmtFull = (n: number) => n?.toLocaleString() ?? '—'
const pct = (n: number) => `${(n * 100).toFixed(1)}%`

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr']

function getDelta(arr: any[], platform: string, field: string): number {
  const rows = arr.filter((r: any) => r.platform === platform).sort((a: any, b: any) => a.month.localeCompare(b.month))
  if (rows.length < 2) return 0
  const prev = (rows[rows.length - 2] as any)[field] ?? 0
  const curr = (rows[rows.length - 1] as any)[field] ?? 0
  if (!prev) return 0
  return ((curr - prev) / prev) * 100
}

function KPI({ title, value, delta, icon: Icon, color }: { title: string; value: string; delta: number; icon: any; color: string }) {
  const isPos = delta >= 0
  return (
    <div className={`bg-[#0d1117] border border-[#1e2433] rounded-xl p-4 hover:-translate-y-0.5 transition-transform`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{title}</span>
        <div className={`p-1.5 rounded-lg bg-opacity-20`} style={{ backgroundColor: color + '22' }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className={`text-xs flex items-center gap-1 ${isPos ? 'text-[#62d070]' : 'text-[#fc3467]'}`}>
        {isPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {Math.abs(delta).toFixed(1)}% MoM
      </div>
    </div>
  )
}

export default function PulsePage() {
  const ig = SEED_MONTHLY_METRICS.filter((r: any) => r.platform === 'instagram')
  const fb = SEED_MONTHLY_METRICS.filter((r: any) => r.platform === 'facebook')
  const tt = SEED_MONTHLY_METRICS.filter((r: any) => r.platform === 'tiktok')

  const latestIG = ig[ig.length - 1] as any
  const latestFB = fb[fb.length - 1] as any
  const latestTT = tt[tt.length - 1] as any

  const totalTrials = (latestTT?.free_trials ?? 0) + (latestIG?.free_trials ?? 0) + (latestFB?.free_trials ?? 0)
  const totalNewFollows = (latestTT?.new_follows ?? 0) + (latestIG?.new_follows ?? 0) + (latestFB?.new_follows ?? 0)
  const ttFTCR = latestTT?.free_trials && latestTT?.sessions ? latestTT.free_trials / latestTT.sessions : 0

  const chartData = MONTHS.map((m, i) => ({
    month: m,
    TikTok: (tt[i] as any)?.total_views ?? 0,
    Instagram: (ig[i] as any)?.total_views ?? 0,
    Facebook: (fb[i] as any)?.total_views ?? 0,
  }))

  const revenueData = MONTHS.map((m, i) => ({
    month: m,
    TikTok: ((tt[i] as any)?.revenue_ga4 ?? 0) + ((tt[i] as any)?.revenue_shopify ?? 0),
    Instagram: ((ig[i] as any)?.revenue_ga4 ?? 0) + ((ig[i] as any)?.revenue_shopify ?? 0),
    Facebook: ((fb[i] as any)?.revenue_ga4 ?? 0) + ((fb[i] as any)?.revenue_shopify ?? 0),
  }))

  const highRecs = AI_RECOMMENDATIONS_SEED.filter((r: any) => r.priority === 'high')
  const sn = { ig: 862531, tt: 1050000 }
  const topComp = COMPETITOR_SEED.find((c: any) => c.handle === 'registerednursern_com')
  const topCompTT = COMPETITOR_SEED.find((c: any) => c.handle === 'registerednursern.com' && c.platform === 'tiktok')

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pulse</h1>
          <p className="text-sm text-gray-400 mt-0.5">Simple Nursing Social Intelligence · Jan–Apr 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#62d070] live-dot"></span>
          <span className="text-xs text-gray-400">Live · updated just now</span>
        </div>
      </div>

      {/* AI Alert banners */}
      {highRecs.slice(0, 2).map((rec: any, i: number) => (
        <div key={i} className="flex items-start gap-3 bg-[#1a0a0e] border border-[#fc3467]/20 rounded-xl p-4">
          <Bell size={16} className="text-[#fc3467] mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-[#fc3467] uppercase tracking-wide mr-2">HIGH PRIORITY</span>
            <span className="text-sm font-medium text-white">{rec.title}</span>
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{rec.body}</p>
          </div>
        </div>
      ))}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPI title="TikTok Views" value={fmt(latestTT?.total_views ?? 0)} delta={getDelta(SEED_MONTHLY_METRICS as any, 'tiktok', 'total_views')} icon={Eye} color="#75c7e6" />
        <KPI title="IG Reach" value={fmt(latestIG?.accounts_reached ?? 0)} delta={getDelta(SEED_MONTHLY_METRICS as any, 'instagram', 'accounts_reached')} icon={Users} color="#fc3467" />
        <KPI title="FB Views" value={fmt(latestFB?.total_views ?? 0)} delta={getDelta(SEED_MONTHLY_METRICS as any, 'facebook', 'total_views')} icon={Eye} color="#00709c" />
        <KPI title="Free Trials" value={fmtFull(totalTrials)} delta={-34} icon={MousePointer} color="#62d070" />
        <KPI title="TikTok FTCR" value={pct(ttFTCR)} delta={-87} icon={Zap} color="#fad74f" />
        <KPI title="New Followers" value={fmt(totalNewFollows)} delta={getDelta(SEED_MONTHLY_METRICS as any, 'tiktok', 'new_follows')} icon={TrendingUp} color="#62d070" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Monthly Views by Platform</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={(v) => fmt(v)} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1e2433', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [fmtFull(v), '']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="TikTok" stroke="#75c7e6" strokeWidth={2} dot={{ fill: '#75c7e6', r: 3 }} />
              <Line type="monotone" dataKey="Instagram" stroke="#fc3467" strokeWidth={2} dot={{ fill: '#fc3467', r: 3 }} />
              <Line type="monotone" dataKey="Facebook" stroke="#00709c" strokeWidth={2} dot={{ fill: '#00709c', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Revenue by Platform (GA4 + Shopify)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1e2433', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => [`$${v.toFixed(0)}`, '']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="TikTok" fill="#75c7e6" radius={[3,3,0,0]} />
              <Bar dataKey="Instagram" fill="#fc3467" radius={[3,3,0,0]} />
              <Bar dataKey="Facebook" fill="#00709c" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Wins + Watch + Competitor Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Wins */}
        <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#62d070] mb-3 flex items-center gap-2">
            <TrendingUp size={14} /> Top 3 Wins
          </h2>
          <div className="space-y-3">
            <div className="text-sm"><div className="text-white font-medium">TikTok Feb: 464 free trials</div><div className="text-xs text-gray-400">Best trial month of 2026, 585K engaged audience</div></div>
            <div className="text-sm"><div className="text-white font-medium">IG March: 12.9K new follows</div><div className="text-xs text-gray-400">2x step change from 5.8K, held at 12.5K in Apr</div></div>
            <div className="text-sm"><div className="text-white font-medium">FB March: 4.9M reach</div><div className="text-xs text-gray-400">Biggest reach month, 94% non-follower views</div></div>
          </div>
        </div>

        {/* Watch List */}
        <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#fad74f] mb-3 flex items-center gap-2">
            <TrendingDown size={14} /> Watch List
          </h2>
          <div className="space-y-3">
            <div className="text-sm"><div className="text-white font-medium">TikTok FTCR: 15.3% → 2.0%</div><div className="text-xs text-gray-400">Feb to Apr, -87% conversion collapse</div></div>
            <div className="text-sm"><div className="text-white font-medium">TikTok revenue: -$1,340/mo</div><div className="text-xs text-gray-400">Apr GA4 $281 vs Jan $1,621</div></div>
            <div className="text-sm"><div className="text-white font-medium">IG shares: 18.7K → 5.3K</div><div className="text-xs text-gray-400">Jan to Apr, content virality declining</div></div>
          </div>
        </div>

        {/* Competitor Snapshot */}
        <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#75c7e6] mb-3 flex items-center gap-2">
            <Users size={14} /> Competitor Snapshot
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">SimpleNursing IG</span>
              <span className="text-white font-semibold">{fmt(sn.ig)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#fc3467]">RegisteredNurseRN IG ↑</span>
              <span className="text-[#fc3467] font-semibold">{fmt(topComp?.followers ?? 0)}</span>
            </div>
            <div className="border-t border-[#1e2433] pt-2 mt-2"></div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">SimpleNursing TT</span>
              <span className="text-white font-semibold">{fmt(sn.tt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#fc3467]">RegisteredNurseRN TT ↑</span>
              <span className="text-[#fc3467] font-semibold">{fmt(topCompTT?.followers ?? 0)}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">RegisteredNurseRN leads on both platforms</div>
          </div>
        </div>
      </div>

      {/* Trending hashtags strip */}
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">🔥 Trending Now in Nursing</h2>
          <a href="/trends" className="text-xs text-[#75c7e6] hover:underline">View all →</a>
        </div>
        <div className="flex flex-wrap gap-2">
          {TRENDING_HASHTAGS_SEED.sort((a: any, b: any) => b.velocity_24h - a.velocity_24h).map((h: any) => (
            <span key={h.hashtag} className={`px-3 py-1 rounded-full text-xs font-medium border ${h.velocity_24h > 6 ? 'bg-[#fc3467]/10 border-[#fc3467]/30 text-[#fc3467]' : h.velocity_24h > 4 ? 'bg-[#fad74f]/10 border-[#fad74f]/30 text-[#fad74f]' : 'bg-[#1e2433] border-[#2a3447] text-gray-300'}`}>
              #{h.hashtag} <span className="opacity-60">+{h.velocity_24h}%</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
