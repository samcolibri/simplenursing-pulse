'use client'
import { useState } from 'react'
import { AlertCircle, Download, TrendingUp } from 'lucide-react'

const MOCK_POSTS = [
  { platform: 'tiktok', date: '2026-04-28', type: 'video', caption: 'ECG Rhythms You Need to Know for Nursing School and Nursing', views: 1400000, likes: 53000, comments: 171, shares: 8154, saves: 4200, er: 4.68, topic: 'ECG/Cardiology', account: '@registerednursern.com', isComp: true },
  { platform: 'tiktok', date: '2026-04-21', type: 'video', caption: 'Metabolic Panel (Nursing Lab Values) explained for nursing students', views: 861100, likes: 32000, comments: 163, shares: 1897, saves: 2800, er: 4.27, topic: 'Lab Values', account: '@registerednursern.com', isComp: true },
  { platform: 'tiktok', date: '2026-04-18', type: 'video', caption: 'NCLEX Study Tips — 5 things I wish I knew before boards', views: 440000, likes: 18000, comments: 89, shares: 3200, saves: 5100, er: 6.0, topic: 'NCLEX Prep', account: '@simplenursing', isComp: false },
  { platform: 'tiktok', date: '2026-04-15', type: 'video', caption: 'Medication Safety Mnemonics that actually work for nursing school', views: 320000, likes: 14000, comments: 72, shares: 1800, saves: 3900, er: 6.18, topic: 'Pharmacology', account: '@simplenursing', isComp: false },
  { platform: 'tiktok', date: '2026-04-10', type: 'video', caption: 'Nursing School Survival Guide — what actually matters', views: 280000, likes: 11000, comments: 55, shares: 1400, saves: 2200, er: 5.23, topic: 'Study Tips', account: '@simplenursing', isComp: false },
  { platform: 'tiktok', date: '2026-04-07', type: 'video', caption: 'Heart Failure — the easiest way to understand it', views: 195000, likes: 8500, comments: 44, shares: 1100, saves: 1800, er: 5.87, topic: 'Cardiology', account: '@simplenursing', isComp: false },
  { platform: 'instagram', date: '2026-04-25', type: 'reel', caption: 'ECG EKG Interpretation Study Guide for Nursing School Students', views: 0, likes: 33321, comments: 289, shares: 0, saves: 0, er: 3.51, topic: 'ECG/Cardiology', account: '@registerednursern_com', isComp: true },
  { platform: 'instagram', date: '2026-04-20', type: 'carousel', caption: 'Lab Values Every Nurse Needs to Know — swipe for full breakdown', views: 0, likes: 2456, comments: 9, shares: 142, saves: 1890, er: 0.51, topic: 'Lab Values', account: '@simplenursing.com_', isComp: false },
  { platform: 'instagram', date: '2026-04-14', type: 'reel', caption: "The NCLEX is not a nursing test — it's a critical thinking test", views: 0, likes: 710, comments: 5, shares: 88, saves: 420, er: 0.14, topic: 'NCLEX Prep', account: '@simplenursing.com_', isComp: false },
  { platform: 'instagram', date: '2026-04-08', type: 'image', caption: 'Fluid & Electrolytes simplified with this one trick', views: 0, likes: 252, comments: 8, shares: 22, saves: 180, er: 0.05, topic: 'Physiology', account: '@simplenursing.com_', isComp: false },
  { platform: 'pinterest', date: '2026-05-25', type: 'video', caption: "Cushing's Syndrome: Everything You Need to Know (Nursing Lesson)", views: 0, likes: 0, comments: 0, shares: 0, saves: 42, er: 0, topic: 'Endocrinology', account: '@simplenursing_official', isComp: false },
  { platform: 'pinterest', date: '2026-05-24', type: 'video', caption: 'New Grad Nurses — What No One Tells You About Your First Year', views: 0, likes: 0, comments: 0, shares: 0, saves: 38, er: 0, topic: 'Career', account: '@simplenursing_official', isComp: false },
  { platform: 'pinterest', date: '2026-05-22', type: 'image', caption: "The \$100K Nursing Idea Most Nurses Don't Know About", views: 0, likes: 0, comments: 0, shares: 0, saves: 71, er: 0, topic: 'Career', account: '@simplenursing_official', isComp: false },
  { platform: 'pinterest', date: '2026-05-20', type: 'video', caption: 'NCLEX Prep Tips — Study Smarter, Not Harder', views: 0, likes: 0, comments: 0, shares: 0, saves: 55, er: 0, topic: 'NCLEX Prep', account: '@simplenursing_official', isComp: false },
  { platform: 'pinterest', date: '2026-05-18', type: 'carousel', caption: 'Memorial Day — Thank a Nurse Today #NursingHero', views: 0, likes: 0, comments: 0, shares: 0, saves: 29, er: 0, topic: 'Holiday', account: '@simplenursing_official', isComp: false },
]

const fmt = (n: number) => n > 0 ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n) : '—'
const PLATFORM_COLORS: Record<string, string> = {
  tiktok: '#75c7e6',
  instagram: '#fc3467',
  facebook: '#00709c',
  pinterest: '#e60036',
}

function exportCSV(data: typeof MOCK_POSTS) {
  const headers = ['Platform', 'Date', 'Type', 'Caption', 'Views', 'Likes', 'Comments', 'Shares', 'Saves', 'ER%', 'Topic', 'Account']
  const rows = data.map(p => [p.platform, p.date, p.type, '"' + p.caption + '"', p.views, p.likes, p.comments, p.shares, p.saves, p.er, p.topic, p.account])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'sn-posts.csv'; a.click()
  URL.revokeObjectURL(url)
}

export default function PostsPage() {
  const [platform, setPlatform] = useState('all')
  const [sort, setSort] = useState('views')
  const [expanded, setExpanded] = useState<number | null>(null)

  const filtered = MOCK_POSTS
    .filter(p => platform === 'all' || p.platform === platform)
    .sort((a: any, b: any) => (b[sort] ?? 0) - (a[sort] ?? 0))

  const isPinterest = platform === 'pinterest'

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Posts</h1>
          <p className="text-sm text-gray-400 mt-0.5">Own + competitor posts sorted by engagement</p>
        </div>
        <button onClick={() => exportCSV(filtered)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1e2433] text-gray-400 hover:border-[#75c7e6]/30 hover:text-[#75c7e6] text-xs transition-colors">
          <Download size={12} /> Export CSV
        </button>
      </div>

      {!isPinterest && (
        <div className="flex items-start gap-3 bg-[#0f110a] border border-[#fad74f]/20 rounded-xl p-4">
          <AlertCircle size={14} className="text-[#fad74f] mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="font-semibold text-[#fad74f]">Connect Meta API</span>
            <span className="text-gray-400"> to see your own Instagram + Facebook post-level insights. Currently showing Apify-scraped + sample data.</span>
          </div>
        </div>
      )}

      {isPinterest && (
        <div className="flex items-start gap-3 bg-[#1a0009] border border-[#e60036]/20 rounded-xl p-4">
          <span className="text-[#e60036] mt-0.5 shrink-0">📌</span>
          <div className="text-sm">
            <span className="font-semibold text-[#e60036]">Pinterest API Connected</span>
            <span className="text-gray-400"> · simplenursing_official · 148,882 monthly views · 125K impressions in May 2026. Saves = highest-intent signal on Pinterest.</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {['all', 'tiktok', 'instagram', 'facebook', 'pinterest'].map(p => {
          const color = PLATFORM_COLORS[p] ?? '#75c7e6'
          const active = platform === p
          return (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              style={active ? { background: color + '18', borderColor: color + '55', color } : {}}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border ${active ? '' : 'bg-[#0d1117] border-[#1e2433] text-gray-400 hover:text-white'}`}
            >
              {p}
            </button>
          )
        })}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="ml-auto px-3 py-1.5 rounded-lg text-xs bg-[#0d1117] border border-[#1e2433] text-gray-400 focus:outline-none focus:border-[#75c7e6]/30"
        >
          <option value="views">Sort: Views</option>
          <option value="likes">Sort: Likes</option>
          <option value="er">Sort: Engagement Rate</option>
          <option value="shares">Sort: Shares</option>
          <option value="saves">Sort: Saves</option>
        </select>
      </div>

      <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e2433]">
                {['Platform', 'Date', 'Caption',
                  ...(isPinterest ? ['Saves'] : ['Views', 'Likes', 'Comments', 'Shares', 'ER%']),
                  'Topic'
                ].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((post, i) => (
                <>
                  <tr
                    key={i}
                    onClick={() => setExpanded(expanded === i ? null : i)}
                    className={`border-b border-[#1e2433]/50 hover:bg-[#161b22] cursor-pointer transition-colors ${post.isComp ? 'border-l-2 border-l-[#fad74f]' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: PLATFORM_COLORS[post.platform] + '22', color: PLATFORM_COLORS[post.platform] }}
                      >
                        {post.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{post.date}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-xs text-white truncate">{post.caption}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{post.account}{post.isComp ? ' 🔍 competitor' : ''}</div>
                    </td>
                    {isPinterest ? (
                      <td className="px-4 py-3 text-[#e60036] font-semibold">{post.saves > 0 ? post.saves : '—'}</td>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-white">{fmt(post.views)}</td>
                        <td className="px-4 py-3 text-white">{fmt(post.likes)}</td>
                        <td className="px-4 py-3 text-gray-300">{fmt(post.comments)}</td>
                        <td className="px-4 py-3 text-gray-300">{fmt(post.shares)}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${post.er > 5 ? 'text-[#62d070]' : post.er > 2 ? 'text-[#fad74f]' : 'text-gray-400'}`}>
                            {post.er > 0 ? post.er + '%' : '—'}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1e2433] text-gray-300">{post.topic}</span>
                    </td>
                  </tr>
                  {expanded === i && (
                    <tr key={`${i}-exp`} className="border-b border-[#1e2433]/50 bg-[#161b22]">
                      <td colSpan={isPinterest ? 5 : 9} className="px-6 py-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {isPinterest ? (
                            [['Saves', post.saves], ['Type', post.type], ['Category', post.topic], ['Account', post.account]].map(([k, v]) => (
                              <div key={String(k)}>
                                <div className="text-xs text-gray-500">{k}</div>
                                <div className="text-lg font-bold text-white">{v}</div>
                              </div>
                            ))
                          ) : (
                            [['Views', post.views], ['Likes', post.likes], ['Comments', post.comments], ['Shares', post.shares], ['Saves', post.saves], ['Engagement Rate', post.er + '%']].map(([k, v]) => (
                              <div key={String(k)}>
                                <div className="text-xs text-gray-500">{k}</div>
                                <div className="text-lg font-bold text-white">{typeof v === 'number' && v > 999 ? fmt(v) : v}</div>
                              </div>
                            ))
                          )}
                        </div>
                        {!isPinterest && post.er > 0 && (
                          <div className="mt-3 flex items-center gap-1 text-xs text-[#75c7e6]">
                            <TrendingUp size={11} />
                            <span>ER {post.er > 5 ? 'excellent — above 5% is viral territory for nursing content' : post.er > 2 ? 'good — above platform average' : 'below average — review hook and CTA'}</span>
                          </div>
                        )}
                        {isPinterest && (
                          <div className="mt-3 flex items-center gap-2 text-xs text-[#e60036]">
                            <span>📌</span>
                            <span>Saves on Pinterest signal high-intent bookmarking — nursing students saving content to study later</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
