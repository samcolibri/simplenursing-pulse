'use client'

import { useState } from 'react'
import { TRENDING_HASHTAGS_SEED } from '@/lib/data'
import { TrendingUp, Music, Lightbulb, Flame } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip,
} from 'recharts'

const SN_USED: Record<string, boolean> = {
  nursingstudent: true,
  nursetok: true,
  nclex: true,
  nursingschool: false,
  shiftlife: false,
  medtok: false,
  studentnurse: false,
  futurenurse: false,
  nursememes: false,
  scrublife: false,
}

const TRENDING_AUDIO = [
  { title: 'As It Was', artist: 'Harry Styles', uses: 2100000, trend: 'up', platform: 'tiktok' },
  { title: 'Escapism', artist: 'RAYE ft. 070 Shake', uses: 980000, trend: 'up', platform: 'tiktok' },
  { title: 'Love Story (Remix)', artist: 'Taylor Swift', uses: 640000, trend: 'stable', platform: 'tiktok' },
  { title: 'Running Up That Hill', artist: 'Kate Bush', uses: 510000, trend: 'up', platform: 'tiktok' },
  { title: 'Anti-Hero', artist: 'Taylor Swift', uses: 420000, trend: 'down', platform: 'tiktok' },
]

const CONTENT_PROMPTS = [
  {
    hashtags: ['#nursetok', '#shiftlife'],
    prompt: 'ECG content is going viral — post a SimpleNursing ECG breakdown using #nursetok + #shiftlife',
    why: 'RegisteredNurseRN hit 1.4M views on ECG content this week. Riding this wave now could yield 500K+ views.',
    color: '#fc3467',
  },
  {
    hashtags: ['#scrublife', '#futurenurse'],
    prompt: '"What\'s in my nursing school bag" — lifestyle content tagged with #scrublife + #futurenurse for top-of-funnel reach',
    why: '#scrublife is at 8.4% velocity and SimpleNursing hasn\'t used it in 14 days. Cross-promote to new segments.',
    color: '#fad74f',
  },
  {
    hashtags: ['#nclex', '#medtok'],
    prompt: 'Post a lab values cheat sheet — save rate on this format is 3-4x average across all nursing accounts',
    why: 'Competitor data shows lab value posts generate 2x saves vs average. High save = higher future reach.',
    color: '#62d070',
  },
]

type Platform = 'all' | 'tiktok' | 'instagram' | 'facebook'

function velocityColor(v: number) {
  if (v >= 6) return 'text-[#fc3467]'
  if (v >= 4) return 'text-[#fad74f]'
  return 'text-[#62d070]'
}

function velocityBg(v: number) {
  if (v >= 6) return 'bg-[#fc3467]/10 border-[#fc3467]/20'
  if (v >= 4) return 'bg-[#fad74f]/10 border-[#fad74f]/20'
  return 'bg-[#62d070]/10 border-[#62d070]/20'
}

function SparkArea({ velocity }: { velocity: number }) {
  const seed = velocity * 1000
  const data = [
    { v: Math.round(seed * 0.6) },
    { v: Math.round(seed * 0.75) },
    { v: Math.round(seed * 0.85) },
    { v: Math.round(seed * 0.92) },
    { v: Math.round(seed * 1.0) },
  ]
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#75c7e6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#75c7e6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke="#75c7e6" strokeWidth={1.5} fill="url(#sparkGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function TrendsPage() {
  const [activePlatform, setActivePlatform] = useState<Platform>('tiktok')

  const sorted = [...TRENDING_HASHTAGS_SEED].sort((a, b) => b.velocity_24h - a.velocity_24h)
  const filtered = activePlatform === 'all' ? sorted : sorted.filter(h => h.platform === activePlatform)
  const top5 = sorted.slice(0, 5)

  const platforms: { key: Platform; label: string }[] = [
    { key: 'tiktok', label: 'TikTok' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'facebook', label: 'Facebook' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trending in Nursing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Updated every hour · velocity = % growth in 24h posts</p>
        </div>
        <div className="flex bg-[#0d1117] border border-[#1e2433] rounded-lg overflow-hidden">
          {platforms.map(p => (
            <button
              key={p.key}
              onClick={() => setActivePlatform(p.key)}
              className={`px-4 py-2 text-xs font-medium transition-colors ${
                activePlatform === p.key
                  ? 'bg-[#75c7e6]/15 text-[#75c7e6]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Velocity Leaders */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Flame size={14} className="text-[#fc3467]" />
          <h2 className="text-sm font-semibold text-white">Velocity Leaders (24h)</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
          {top5.map((h, i) => (
            <div
              key={h.hashtag}
              className={`bg-[#0d1117] border ${velocityBg(h.velocity_24h)} rounded-xl p-4`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">#{i + 1}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#1e2433] rounded text-gray-400 capitalize">{h.platform}</span>
              </div>
              <p className="text-sm font-bold text-white mb-1">#{h.hashtag}</p>
              <p className={`text-2xl font-bold ${velocityColor(h.velocity_24h)}`}>+{h.velocity_24h}%</p>
              <SparkArea velocity={h.velocity_24h} />
              <p className="text-[10px] text-gray-500">{(h.post_count / 1_000_000).toFixed(1)}M posts</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hashtag Table */}
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2433] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp size={14} className="text-[#75c7e6]" />
            All Hashtags
          </h2>
          <span className="text-xs text-gray-500">{filtered.length} results</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2433]">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Hashtag</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Platform</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Post Count</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">24h Velocity</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Used by SN?</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => (
                <tr key={i} className="border-b border-[#1e2433] hover:bg-[#161b22] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">#{h.hashtag}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400 capitalize">{h.platform}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300 text-xs">
                    {h.post_count >= 1_000_000
                      ? `${(h.post_count / 1_000_000).toFixed(1)}M`
                      : `${(h.post_count / 1000).toFixed(0)}K`}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold text-xs ${velocityColor(h.velocity_24h)}`}>
                      +{h.velocity_24h}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {SN_USED[h.hashtag] ? (
                      <span className="text-[#62d070] text-xs font-semibold">Yes</span>
                    ) : (
                      <span className="text-gray-600 text-xs">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trending Audio */}
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Music size={14} className="text-[#75c7e6]" />
          Trending Sounds on TikTok
        </h2>
        <div className="space-y-2">
          {TRENDING_AUDIO.map((audio, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-[#1e2433] last:border-0">
              <span className="text-xs text-gray-600 font-mono w-4 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">{audio.title}</p>
                <p className="text-xs text-gray-500">{audio.artist}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-300">{(audio.uses / 1000).toFixed(0)}K uses</p>
                <p className={`text-xs font-semibold ${audio.trend === 'up' ? 'text-[#62d070]' : audio.trend === 'down' ? 'text-red-400' : 'text-gray-500'}`}>
                  {audio.trend === 'up' ? '↑ Rising' : audio.trend === 'down' ? '↓ Fading' : '→ Stable'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What to Post This Week */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} className="text-[#fad74f]" />
          <h2 className="text-sm font-semibold text-white">What to Post This Week</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CONTENT_PROMPTS.map((p, i) => (
            <div key={i} className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-4" style={{ borderLeftColor: p.color, borderLeftWidth: 2 }}>
              <div className="flex flex-wrap gap-1 mb-2">
                {p.hashtags.map(h => (
                  <span key={h} className="px-2 py-0.5 bg-[#1e2433] text-[#75c7e6] rounded-full text-xs">{h}</span>
                ))}
              </div>
              <p className="text-sm text-white font-medium leading-snug mb-2">{p.prompt}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{p.why}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
