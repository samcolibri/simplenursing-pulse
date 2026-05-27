'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { BUDGET_2026, BUDGET_ANNUAL_TOTAL, BUDGET_TO_SPEND, MONTHS, sumMonthly } from '@/lib/excel-data'

const fmtMoney = (n) => n == null ? '—' : '$' + Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })
const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('en-US', { notation: 'compact' }).format(n)

const CATEGORIES = [
  { key: 'social_media_shoots', label: 'Social Media Shoots', color: '#75c7e6' },
  { key: 'podcast',             label: 'Podcast',             color: '#9d4edd' },
  { key: 'influencers_ugc',     label: 'Influencers / UGC',   color: '#fc3467' },
  { key: 'giveaways',           label: 'Giveaways',           color: '#fad74f' },
  { key: 'f_learning',          label: 'F-Learning',          color: '#62d070' },
  { key: 'video_editors',       label: 'Video Editors',       color: '#e60036' },
  { key: 'script_writers',      label: 'Script Writers',      color: '#00709c' },
]

export default function BudgetPage() {
  const ytdSpent = CATEGORIES.reduce((s, c) => s + sumMonthly(BUDGET_2026[c.key].slice(0, 4)), 0)
  const annualPlanned = CATEGORIES.reduce((s, c) => s + sumMonthly(BUDGET_2026[c.key]), 0)
  const remaining = annualPlanned - ytdSpent

  const monthlyData = MONTHS.map((m, i) => {
    const obj = { month: m }
    let total = 0
    for (const c of CATEGORIES) { obj[c.label] = BUDGET_2026[c.key][i]; total += BUDGET_2026[c.key][i] || 0 }
    obj.Total = total
    return obj
  })

  const categoryTotals = CATEGORIES.map(c => ({
    name: c.label, value: sumMonthly(BUDGET_2026[c.key]), color: c.color,
  })).sort((a, b) => b.value - a.value)

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      <div>
        <div className="mono text-[10px] uppercase tracking-widest text-[var(--text-dim)] mb-2">2026 Budget · Excel verified</div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Budget</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">Source: Social Performance Tracker (2026).xlsx · sheet "2026 Budget"</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="text-xs text-[var(--text-dim)] mb-1">Annual planned</div>
          <div className="num-xl text-2xl">{fmtMoney(annualPlanned)}</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">All categories combined</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-[var(--text-dim)] mb-1">YTD spent (Jan-Apr)</div>
          <div className="num-xl text-2xl text-[#75c7e6]">{fmtMoney(ytdSpent)}</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">{((ytdSpent / annualPlanned) * 100).toFixed(1)}% of annual</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-[var(--text-dim)] mb-1">Remaining 2026</div>
          <div className="num-xl text-2xl text-[#62d070]">{fmtMoney(remaining)}</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">8 months left</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-[var(--text-dim)] mb-1">Excel "to spend"</div>
          <div className="num-xl text-2xl text-[#fad74f]">{fmtMoney(BUDGET_TO_SPEND)}</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">Top-line cell value</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card-strong p-4">
          <div className="text-sm font-semibold mb-3">Monthly stack · all categories</div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={(v) => '$' + fmt(v)} />
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 10 }} formatter={(v) => fmtMoney(v)} />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                {CATEGORIES.map(c => <Bar key={c.key} dataKey={c.label} stackId="a" fill={c.color} />)}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-strong p-4">
          <div className="text-sm font-semibold mb-3">Annual mix</div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryTotals} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={90}>
                  {categoryTotals.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #2a3142', borderRadius: 8, fontSize: 11 }} formatter={(v) => fmtMoney(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-strong overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Category</th>
              {MONTHS.map(m => <th key={m} className="text-right px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">{m}</th>)}
              <th className="text-right px-3 py-3 text-[var(--text-dim)] mono text-[10px] uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/50">
            {CATEGORIES.map(c => (
              <tr key={c.key}>
                <td className="px-3 py-2.5 font-medium" style={{ color: c.color }}>{c.label}</td>
                {BUDGET_2026[c.key].map((v, i) => <td key={i} className="px-3 py-2.5 text-right text-[var(--text-muted)]">{v ? fmtMoney(v) : '—'}</td>)}
                <td className="px-3 py-2.5 text-right font-semibold">{fmtMoney(sumMonthly(BUDGET_2026[c.key]))}</td>
              </tr>
            ))}
            <tr className="bg-[var(--bg-card)]">
              <td className="px-3 py-3 font-bold">TOTAL</td>
              {MONTHS.map((m, i) => {
                const monthTotal = CATEGORIES.reduce((s, c) => s + (BUDGET_2026[c.key][i] || 0), 0)
                return <td key={i} className="px-3 py-3 text-right font-bold text-white">{monthTotal > 0 ? fmtMoney(monthTotal) : '—'}</td>
              })}
              <td className="px-3 py-3 text-right font-bold text-[#62d070]">{fmtMoney(annualPlanned)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  )
}
