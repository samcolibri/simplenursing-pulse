'use client'
import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts'
import {
  INSTAGRAM_2026, INSTAGRAM_2025, FACEBOOK_2026, FACEBOOK_2025,
  TIKTOK_2026, TIKTOK_2025, YOUTUBE_2026, YOUTUBE_2025,
  PODCAST_2026, MONTHS, sumMonthly, yoyPct,
} from '@/lib/excel-data'

const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
const fmtFull = (n) => n == null ? '—' : Number(n).toLocaleString()
const fmtPct = (n) => n == null ? '—' : (n * 100).toFixed(1) + '%'
const fmtMoney = (n) => n == null ? '—' : '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })

const PLATFORMS = [
  { id: 'tiktok',    name: 'TikTok',    color: '#75c7e6', glyph: '🎵' },
  { id: 'instagram', name: 'Instagram', color: '#fc3467', glyph: '📷' },
  { id: 'facebook',  name: 'Facebook',  color: '#00709c', glyph: '📘' },
  { id: 'pinterest', name: 'Pinterest', color: '#e60036', glyph: '📌' },
  { id: 'youtube',   name: 'YouTube',   color: '#ff0000', glyph: '▶️' },
  { id: 'podcast',   name: 'Podcast',   color: '#9d4edd', glyph: '🎙️' },
]

const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
function useStaticData(file) {
  const [data, setData] = useState(null)
  useEffect(() => { fetch(base + '/data/' + file + '.json', { cache: 'no-store' }).then(r => r.json()).then(setData).catch(() => {}) }, [file])
  return data
}

function StatBox({ label, value, sub, color }) {
  return (
    <div className="card p-4">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] mb-1">{label}</div>
      <div className="text-2xl font-bold num-xl" style={{ color: color || '#fff' }}>{value}</div>
      {sub && <div className="text-[11px] text-[var(--text-muted)] mt-1">{sub}</div>}
    </div>
  )
}

function YoYChart({ data2026, data2025, color, label, height = 220 }) {
  const chartData = MONTHS.map((m, i) => ({ month: m, '2026': data2026[i], '2025': data2025[i] }))
  return (
    <div className="card-strong p-4">
      <div className="text-sm font-semibold mb-3">{label}</div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={fmt} />
            <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 11 }} formatter={(v) => fmtFull(v)} />
            <Legend wrapperStyle={{ fontSize: 10 }} iconType="line" />
            <Line type="monotone" dataKey="2026" stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} />
            <Line type="monotone" dataKey="2025" stroke={color} strokeWidth={1.5} strokeDasharray="4 4" dot={false} opacity={0.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Per-platform views ───────────────────────────────────────────────────────
function TikTokView({ live }) {
  const c = '#75c7e6'
  const v26 = sumMonthly(TIKTOK_2026.views), v25 = sumMonthly(TIKTOK_2025.views.slice(0, 4))
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="Live followers" value={fmt(live?.owned?.followers)} sub="Apify · just now" color={c} />
        <StatBox label="YTD 2026 views" value={fmt(v26)} sub={'+' + fmtPct(yoyPct(v26, v25)) + ' YoY'} />
        <StatBox label="Apr 2026 free trials" value={fmtFull(TIKTOK_2026.free_trials[3])} sub={'FTCR ' + fmtPct(TIKTOK_2026.ftcr[3])} />
        <StatBox label="Apr GA4 revenue" value={fmtMoney(TIKTOK_2026.revenue_ga4[3])} sub="UTM-attributed" color="#62d070" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <YoYChart data2026={TIKTOK_2026.views} data2025={TIKTOK_2025.views} color={c} label="Monthly views — 2026 vs 2025" />
        <YoYChart data2026={TIKTOK_2026.new_follows} data2025={TIKTOK_2025.new_follows} color={c} label="New follows — 2026 vs 2025" />
      </div>
      <div className="card-strong overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Metric</th>
              {MONTHS.slice(0, 4).map(m => <th key={m} className="text-right px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">{m} 2026</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {[
              ['Views',         TIKTOK_2026.views, fmtFull],
              ['Reached',       TIKTOK_2026.reached_audience, fmtFull],
              ['Profile views', TIKTOK_2026.profile_views, fmtFull],
              ['Engaged',       TIKTOK_2026.engaged_audience, fmtFull],
              ['Likes',         TIKTOK_2026.likes, fmtFull],
              ['Comments',      TIKTOK_2026.comments, fmtFull],
              ['Shares',        TIKTOK_2026.shares, fmtFull],
              ['Saves',         TIKTOK_2026.saves, fmtFull],
              ['New follows',   TIKTOK_2026.new_follows, fmtFull],
              ['# of posts',    TIKTOK_2026.num_posts, fmtFull],
              ['Sessions GA4',  TIKTOK_2026.sessions_ga4, fmtFull],
              ['Free trials',   TIKTOK_2026.free_trials, fmtFull],
              ['FTCR',          TIKTOK_2026.ftcr, fmtPct],
              ['GA4 revenue',   TIKTOK_2026.revenue_ga4, fmtMoney],
              ['Shopify revenue', TIKTOK_2026.shopify_revenue, fmtMoney],
            ].map(([label, arr, formatter]) => (
              <tr key={label}>
                <td className="px-3 py-2 text-[var(--text-muted)]">{label}</td>
                {arr.slice(0, 4).map((v, i) => <td key={i} className="px-3 py-2 text-right font-medium">{formatter(v)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InstagramView({ live }) {
  const c = '#fc3467'
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="Live followers" value={fmt(live?.owned?.followers)} sub="Apify · just now" color={c} />
        <StatBox label="Apr accounts reached" value={fmt(INSTAGRAM_2026.accounts_reached[3])} sub="Excel verified" />
        <StatBox label="Apr free trials" value={fmtFull(INSTAGRAM_2026.free_trials[3])} sub={'FTCR ' + fmtPct(INSTAGRAM_2026.ftcr[3])} />
        <StatBox label="Apr GA4 revenue" value={fmtMoney(INSTAGRAM_2026.revenue_ga4[3])} sub="UTM-attributed" color="#62d070" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <YoYChart data2026={INSTAGRAM_2026.accounts_reached} data2025={INSTAGRAM_2025.accounts_reached} color={c} label="Accounts reached — 2026 vs 2025" />
        <YoYChart data2026={INSTAGRAM_2026.new_follows} data2025={INSTAGRAM_2025.new_follows} color={c} label="New follows — 2026 vs 2025" />
      </div>
      <div className="card-strong overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Metric</th>
              {MONTHS.slice(0, 4).map(m => <th key={m} className="text-right px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">{m} 2026</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {[
              ['Accounts reached', INSTAGRAM_2026.accounts_reached, fmtFull],
              ['Total views', INSTAGRAM_2026.total_views, fmtFull],
              ['Likes', INSTAGRAM_2026.likes, fmtFull],
              ['Comments', INSTAGRAM_2026.comments, fmtFull],
              ['Shares', INSTAGRAM_2026.shares, fmtFull],
              ['Saves', INSTAGRAM_2026.saves, fmtFull],
              ['New follows', INSTAGRAM_2026.new_follows, fmtFull],
              ['Sessions', INSTAGRAM_2026.sessions, fmtFull],
              ['Free trials', INSTAGRAM_2026.free_trials, fmtFull],
              ['FTCR', INSTAGRAM_2026.ftcr, fmtPct],
              ['GA4 revenue', INSTAGRAM_2026.revenue_ga4, fmtMoney],
              ['Shopify revenue', INSTAGRAM_2026.shopify_revenue, fmtMoney],
              ['IG bonus', INSTAGRAM_2026.ig_bonus, fmtMoney],
            ].map(([label, arr, formatter]) => (
              <tr key={label}>
                <td className="px-3 py-2 text-[var(--text-muted)]">{label}</td>
                {arr.slice(0, 4).map((v, i) => <td key={i} className="px-3 py-2 text-right font-medium">{formatter(v)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FacebookView() {
  const c = '#00709c'
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="Apr views" value={fmt(FACEBOOK_2026.views[3])} sub="Excel verified" color={c} />
        <StatBox label="Apr accounts reached" value={fmt(FACEBOOK_2026.accounts_reached[3])} sub={fmtPct(0.842) + ' non-follower'} />
        <StatBox label="Apr free trials" value={fmtFull(FACEBOOK_2026.free_trials[3])} sub={'FTCR ' + fmtPct(FACEBOOK_2026.ftcr[3])} />
        <StatBox label="Apr GA4 revenue" value={fmtMoney(FACEBOOK_2026.revenue_ga4[3])} sub="UTM-attributed" color="#62d070" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <YoYChart data2026={FACEBOOK_2026.accounts_reached} data2025={FACEBOOK_2025.accounts_reached} color={c} label="Reach — 2026 vs 2025" />
        <YoYChart data2026={FACEBOOK_2026.new_follows} data2025={FACEBOOK_2025.new_follows} color={c} label="New follows — 2026 vs 2025" />
      </div>
      <div className="card-strong overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Metric</th>
              {MONTHS.slice(0, 4).map(m => <th key={m} className="text-right px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">{m} 2026</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {[
              ['Views', FACEBOOK_2026.views, fmtFull],
              ['Reached', FACEBOOK_2026.accounts_reached, fmtFull],
              ['Visits', FACEBOOK_2026.facebook_visits, fmtFull],
              ['Content interactions', FACEBOOK_2026.content_interactions, fmtFull],
              ['New follows', FACEBOOK_2026.new_follows, fmtFull],
              ['Free trials', FACEBOOK_2026.free_trials, fmtFull],
              ['Sessions GA4', FACEBOOK_2026.sessions_ga4, fmtFull],
              ['FTCR', FACEBOOK_2026.ftcr, fmtPct],
              ['GA4 revenue', FACEBOOK_2026.revenue_ga4, fmtMoney],
            ].map(([label, arr, formatter]) => (
              <tr key={label}>
                <td className="px-3 py-2 text-[var(--text-muted)]">{label}</td>
                {arr.slice(0, 4).map((v, i) => <td key={i} className="px-3 py-2 text-right font-medium">{formatter(v)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function YouTubeView() {
  const c = '#ff0000'
  const v26 = sumMonthly(YOUTUBE_2026.longform_views), v25 = sumMonthly(YOUTUBE_2025.longform_views.slice(0, 4))
  const wt26 = sumMonthly(YOUTUBE_2026.watch_time_hrs), wt25 = sumMonthly(YOUTUBE_2025.watch_time_hrs.slice(0, 4))
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="YTD long-form views" value={fmt(v26)} sub={fmtPct(yoyPct(v26, v25)) + ' YoY'} color={c} />
        <StatBox label="Apr watch time (hrs)" value={fmt(YOUTUBE_2026.watch_time_hrs[3])} sub={fmtPct(yoyPct(wt26, wt25)) + ' YoY'} />
        <StatBox label="Apr impressions" value={fmt(YOUTUBE_2026.longform_impressions[3])} sub="Long-form only" />
        <StatBox label="Apr unique viewers" value={fmt(YOUTUBE_2026.unique_viewers[3])} sub={fmt(YOUTUBE_2026.new_viewers[3]) + ' new'} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <YoYChart data2026={YOUTUBE_2026.longform_views} data2025={YOUTUBE_2025.longform_views} color={c} label="Long-form views — 2026 vs 2025" />
        <YoYChart data2026={YOUTUBE_2026.watch_time_hrs} data2025={YOUTUBE_2025.watch_time_hrs} color={c} label="Watch time (hrs) — 2026 vs 2025" />
      </div>
      <div className="card-strong p-5">
        <div className="text-sm font-semibold mb-3">Traffic source breakdown · Apr 2026</div>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { source: 'YouTube Search', '2026': YOUTUBE_2026.yt_search[3], '2025': YOUTUBE_2025.yt_search[3] },
              { source: 'Suggested', '2026': YOUTUBE_2026.suggested_videos[3], '2025': YOUTUBE_2025.suggested_videos[3] },
              { source: 'Browse', '2026': YOUTUBE_2026.browse_features[3], '2025': YOUTUBE_2025.browse_features[3] },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
              <XAxis dataKey="source" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={fmt} />
              <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 11 }} formatter={(v) => fmtFull(v)} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="2026" fill={c} radius={[3, 3, 0, 0]} />
              <Bar dataKey="2025" fill={c + '55'} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function PinterestView({ live }) {
  const c = '#e60036'
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="Monthly views" value={fmt(live?.profile?.monthly_views)} sub="Pinterest API v5 · live" color={c} />
        <StatBox label="30d impressions" value={fmt(live?.summary?.impressions)} sub={live?.summary?.period} />
        <StatBox label="30d saves" value={fmt(live?.summary?.saves)} sub={'highest-intent metric'} color="#62d070" />
        <StatBox label="Pins / boards" value={fmt(live?.profile?.pin_count) + ' / ' + (live?.profile?.board_count || '—')} sub={(live?.profile?.follower_count || 0) + ' followers'} />
      </div>
      {live?.daily && (
        <div className="card-strong p-4">
          <div className="text-sm font-semibold mb-3">30-day impressions trend</div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={live.daily.map(d => ({ date: d.date.slice(5), impressions: d.metrics?.IMPRESSION || 0, saves: d.metrics?.SAVE || 0 }))}>
                <defs>
                  <linearGradient id="pinG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 9 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={fmt} />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 11 }} formatter={(v) => fmtFull(v)} />
                <Area type="monotone" dataKey="impressions" stroke={c} strokeWidth={2.5} fill="url(#pinG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {live?.boards && (
        <div>
          <div className="text-sm font-semibold mb-3">Public boards</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {live.boards.map(b => (
              <div key={b.id} className="card overflow-hidden">
                {b.image && <img src={b.image} alt="" className="w-full aspect-video object-cover" referrerPolicy="no-referrer" />}
                <div className="p-3">
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-[11px] text-[var(--text-dim)] mt-1">{b.pin_count} pins · {b.follower_count} followers</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {live?.pins && live.pins.length > 0 && (
        <div>
          <div className="text-sm font-semibold mb-3">Latest pins</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {live.pins.slice(0, 10).map(p => (
              <a key={p.id} href={p.link} target="_blank" rel="noreferrer" className="card overflow-hidden group">
                {p.thumbnail && <img src={p.thumbnail} alt="" className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />}
                <div className="p-2">
                  <div className="text-[10px] text-[var(--text-muted)] line-clamp-3">{p.description || p.title || '(no caption)'}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PodcastView() {
  const c = '#9d4edd'
  const totalDownloads = sumMonthly(PODCAST_2026.buzzsprout_downloads)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="YTD Buzzsprout downloads" value={fmt(totalDownloads)} sub="Jan-Mar 2026" color={c} />
        <StatBox label="Mar Spotify plays" value={fmt(PODCAST_2026.spotify_plays[2])} sub={'+' + PODCAST_2026.spotify_followers[2] + ' followers'} />
        <StatBox label="Mar Apple plays" value={fmt(PODCAST_2026.apple_plays[2])} sub={PODCAST_2026.apple_unique[2] + ' unique'} />
        <StatBox label="Mar ad revenue" value={fmtMoney(PODCAST_2026.ad_revenue[2])} sub="Episode monetization" color="#62d070" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-strong p-4">
          <div className="text-sm font-semibold mb-3">Cross-platform plays · Jan-Mar 2026</div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={['Jan', 'Feb', 'Mar'].map((m, i) => ({
                month: m,
                Buzzsprout: PODCAST_2026.buzzsprout_downloads[i],
                Spotify: PODCAST_2026.spotify_plays[i],
                Apple: PODCAST_2026.apple_plays[i],
                YouTube: PODCAST_2026.youtube_views[i],
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={fmt} />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Buzzsprout" fill="#9d4edd" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Spotify" fill="#1db954" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Apple" fill="#a78bfa" radius={[3, 3, 0, 0]} />
                <Bar dataKey="YouTube" fill="#ff0000" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-strong p-4">
          <div className="text-sm font-semibold mb-3">Short-form clip views (TT/IG/FB combined)</div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={['Jan', 'Feb', 'Mar', 'Apr'].map((m, i) => ({ month: m, views: PODCAST_2026.short_form_views[i] }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={fmt} />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 11 }} formatter={(v) => fmtFull(v)} />
                <Bar dataKey="views" fill={c} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card-strong overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Metric</th>
              {['Jan', 'Feb', 'Mar', 'Apr'].map(m => <th key={m} className="text-right px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">{m} 2026</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {[
              ['Buzzsprout downloads', PODCAST_2026.buzzsprout_downloads, fmtFull],
              ['Spotify impressions', PODCAST_2026.spotify_impressions, fmtFull],
              ['Spotify plays', PODCAST_2026.spotify_plays, fmtFull],
              ['Spotify streams', PODCAST_2026.spotify_streams, fmtFull],
              ['Spotify new followers', PODCAST_2026.spotify_followers, fmtFull],
              ['Apple plays', PODCAST_2026.apple_plays, fmtFull],
              ['Apple unique listeners', PODCAST_2026.apple_unique, fmtFull],
              ['Apple followers', PODCAST_2026.apple_followers, fmtFull],
              ['YouTube views', PODCAST_2026.youtube_views, fmtFull],
              ['Ad revenue', PODCAST_2026.ad_revenue, fmtMoney],
              ['Hub sessions', PODCAST_2026.hub_sessions, fmtFull],
              ['Hub free trials', PODCAST_2026.hub_free_trials, fmtFull],
              ['Episodes posted', PODCAST_2026.episodes_posted, fmtFull],
              ['Short-form clip views', PODCAST_2026.short_form_views, fmtFull],
            ].map(([label, arr, formatter]) => (
              <tr key={label}>
                <td className="px-3 py-2 text-[var(--text-muted)]">{label}</td>
                {arr.slice(0, 4).map((v, i) => <td key={i} className="px-3 py-2 text-right font-medium">{formatter(v)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function PlatformsPage() {
  const [active, setActive] = useState('tiktok')
  const tt = useStaticData('tiktok')
  const ig = useStaticData('instagram')
  const pin = useStaticData('pinterest')

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6">
        <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)] mb-2">Per-platform deep dive</div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Platforms</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">Excel-verified historicals + live Apify/API where available · Jan-Apr 2026 vs full 2025 baseline</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-6 -mx-4 sm:mx-0 px-4 sm:px-0">
        {PLATFORMS.map(p => {
          const isActive = active === p.id
          return (
            <button key={p.id} onClick={() => setActive(p.id)}
              className={'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ' +
                (isActive ? '' : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-muted)] hover:text-white')}
              style={isActive ? { background: p.color + '18', borderColor: p.color + '55', color: p.color } : {}}>
              <span>{p.glyph}</span>
              {p.name}
            </button>
          )
        })}
      </div>

      {active === 'tiktok' && <TikTokView live={tt} />}
      {active === 'instagram' && <InstagramView live={ig} />}
      {active === 'facebook' && <FacebookView />}
      {active === 'pinterest' && <PinterestView live={pin} />}
      {active === 'youtube' && <YouTubeView />}
      {active === 'podcast' && <PodcastView />}
    </main>
  )
}
