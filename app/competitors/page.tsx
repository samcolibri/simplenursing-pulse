'use client'

import { useState } from 'react'
import { Plus, Trash2, RefreshCw, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'
import { PlatformBadge } from '@/components/platform-badge'
import { COMPETITOR_SEED, OWNED_ACCOUNTS_SEED } from '@/lib/data'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

const SN_IG = 862531
const SN_TT = 1050000

const engagementData = [
  { name: 'SimpleNursing', platform: 'tiktok', er: 2.27 },
  { name: 'RegisteredNurseRN', platform: 'tiktok', er: 4.62 },
  { name: 'Archer Review', platform: 'tiktok', er: 3.1 },
  { name: 'SimpleNursing', platform: 'instagram', er: 1.8 },
  { name: 'RegisteredNurseRN', platform: 'instagram', er: 3.4 },
  { name: 'Nurse In The Making', platform: 'instagram', er: 2.9 },
  { name: 'YourNursingEducator', platform: 'instagram', er: 2.5 },
]

const cadenceData = [
  { name: 'SimpleNursing', tiktok: 12, instagram: 8, facebook: 5 },
  { name: 'RN RN', tiktok: 9, instagram: 5, facebook: 2 },
  { name: 'Archer Review', tiktok: 7, instagram: 4, facebook: 1 },
  { name: 'NurseInTheMaking', tiktok: 5, instagram: 11, facebook: 3 },
  { name: 'YNE', tiktok: 4, instagram: 7, facebook: 0 },
]

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#75c7e6',
  instagram: '#fc3467',
  facebook: '#00709c',
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#161b22] border border-[#1e2433] rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-white font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function CompetitorsPage() {
  const [addHandle, setAddHandle] = useState('')
  const [addPlatform, setAddPlatform] = useState('tiktok')

  const igCompetitors = COMPETITOR_SEED.filter(c => c.platform === 'instagram')
  const ttCompetitors = COMPETITOR_SEED.filter(c => c.platform === 'tiktok')

  const followerCompare = [
    { name: 'SimpleNursing', followers: SN_IG, isSN: true },
    ...igCompetitors.map(c => ({ name: c.display_name, followers: c.followers, isSN: false })),
  ].sort((a, b) => b.followers - a.followers)

  const ttFollowerCompare = [
    { name: 'SimpleNursing', followers: SN_TT, isSN: true },
    ...ttCompetitors.map(c => ({ name: c.display_name, followers: c.followers, isSN: false })),
  ].sort((a, b) => b.followers - a.followers)

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Competitor Intelligence</h1>
          <p className="text-sm text-gray-500 mt-0.5">Last scraped: 2026-05-27 via Apify · harmonious_notation</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 bg-[#0d1117] border border-[#1e2433] rounded-lg text-xs text-gray-300 hover:text-white hover:border-[#75c7e6]/40 transition-colors">
          <RefreshCw size={13} />
          Rescrape All
        </button>
      </div>

      {/* Viral Post Alert */}
      <div className="bg-[#0d1117] border border-[#fc3467]/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#fc3467]/10 flex items-center justify-center shrink-0">
            <TrendingUp size={14} className="text-[#fc3467]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <PlatformBadge platform="tiktok" />
              <span className="text-xs text-gray-500">@registerednursern.com · 3 days ago</span>
              <span className="ml-auto px-2 py-0.5 bg-[#fc3467]/10 border border-[#fc3467]/20 rounded text-[#fc3467] text-xs font-semibold">VIRAL</span>
            </div>
            <p className="text-sm font-semibold text-white mb-1">"ECG Rhythms You Need to Know for NCLEX"</p>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="text-white font-semibold">1.4M views</span>
              <span>53K likes</span>
              <span>8,154 shares</span>
              <span>171 comments</span>
            </div>
            <p className="text-xs text-[#fad74f] mt-2">
              ⚡ SimpleNursing hasn't posted ECG content in 30+ days. This topic is trending NOW — post a response this week.
            </p>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Engagement Rate Leaderboard */}
        <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4">Engagement Rate Leaderboard</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={engagementData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="er" radius={[0, 3, 3, 0]} maxBarSize={18}>
                {engagementData.map((entry, i) => (
                  <Cell key={i} fill={PLATFORM_COLORS[entry.platform] ?? '#75c7e6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Post Cadence */}
        <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-4">Posts per Week</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cadenceData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="tiktok" fill="#75c7e6" radius={[2, 2, 0, 0]} maxBarSize={20} />
              <Bar dataKey="instagram" fill="#fc3467" radius={[2, 2, 0, 0]} maxBarSize={20} />
              <Bar dataKey="facebook" fill="#00709c" radius={[2, 2, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Follower Comparison */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">Instagram Followers</h2>
          <div className="space-y-2">
            {followerCompare.map((item, i) => {
              const maxF = followerCompare[0].followers
              const width = Math.round((item.followers / maxF) * 100)
              const isAhead = !item.isSN && item.followers > SN_IG
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={item.isSN ? 'text-[#75c7e6] font-semibold' : isAhead ? 'text-[#fc3467]' : 'text-gray-300'}>
                      {item.name}
                      {isAhead && <span className="ml-1 text-[#fc3467]">↑ AHEAD</span>}
                    </span>
                    <span className={item.isSN ? 'text-white font-semibold' : 'text-gray-400'}>{item.followers.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-[#1e2433] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${width}%`, background: item.isSN ? '#75c7e6' : isAhead ? '#fc3467' : '#2a3447' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-3">TikTok Followers</h2>
          <div className="space-y-2">
            {ttFollowerCompare.map((item, i) => {
              const maxF = ttFollowerCompare[0].followers
              const width = Math.round((item.followers / maxF) * 100)
              const isAhead = !item.isSN && item.followers > SN_TT
              return (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={item.isSN ? 'text-[#75c7e6] font-semibold' : isAhead ? 'text-[#fc3467]' : 'text-gray-300'}>
                      {item.name}
                      {isAhead && <span className="ml-1 text-[#fc3467]">↑ AHEAD</span>}
                    </span>
                    <span className={item.isSN ? 'text-white font-semibold' : 'text-gray-400'}>{item.followers.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-[#1e2433] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${width}%`, background: item.isSN ? '#75c7e6' : isAhead ? '#fc3467' : '#2a3447' }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Add Competitor */}
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-4">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Plus size={14} className="text-[#75c7e6]" />
          Add Competitor
        </h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="@handle or profile URL"
            value={addHandle}
            onChange={e => setAddHandle(e.target.value)}
            className="flex-1 bg-[#161b22] border border-[#1e2433] text-sm text-white rounded-lg px-3 py-2 placeholder-gray-600 focus:outline-none focus:border-[#75c7e6]/50"
          />
          <select
            value={addPlatform}
            onChange={e => setAddPlatform(e.target.value)}
            className="bg-[#161b22] border border-[#1e2433] text-sm text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#75c7e6]/50"
          >
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="youtube">YouTube</option>
          </select>
          <button className="px-4 py-2 bg-[#75c7e6] text-[#005374] font-semibold text-sm rounded-lg hover:bg-[#75c7e6]/90 transition-colors">
            Add
          </button>
        </div>
      </div>

      {/* Competitor Table */}
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1e2433]">
          <h2 className="text-sm font-semibold text-white">All Tracked Competitors</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2433]">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Platform</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Handle</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Followers</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tier</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">vs SimpleNursing</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITOR_SEED.map((comp, i) => {
                const snF = comp.platform === 'tiktok' ? SN_TT : comp.platform === 'instagram' ? SN_IG : 580000
                const delta = comp.followers - snF
                const isAhead = delta > 0
                return (
                  <tr key={i} className="border-b border-[#1e2433] hover:bg-[#161b22] transition-colors">
                    <td className="px-4 py-3">
                      <PlatformBadge platform={comp.platform as 'instagram' | 'facebook' | 'tiktok'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white font-medium text-xs">{comp.display_name}</div>
                      <div className="text-gray-500 text-xs">@{comp.handle}</div>
                    </td>
                    <td className="px-4 py-3 text-right text-white font-semibold text-xs">
                      {comp.followers.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-[#1e2433] text-gray-300 rounded text-xs capitalize">{comp.tier}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`flex items-center gap-1 text-xs font-semibold ${isAhead ? 'text-[#fc3467]' : 'text-[#62d070]'}`}>
                        {isAhead ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                        {Math.abs(delta).toLocaleString()} {isAhead ? 'ahead of SN' : 'behind SN'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-red-400 transition-colors">
                        <Trash2 size={11} />
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
