import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { ReactNode } from 'react'

const colorMap = {
  teal: 'border-l-[#75c7e6]',
  pink: 'border-l-[#fc3467]',
  green: 'border-l-[#62d070]',
  yellow: 'border-l-[#fad74f]',
}

interface KpiCardProps {
  title: string
  value: string | number
  change?: number
  subtext?: string
  icon?: ReactNode
  color?: 'teal' | 'pink' | 'green' | 'yellow'
  loading?: boolean
}

export function KpiCard({
  title,
  value,
  change,
  subtext,
  icon,
  color = 'teal',
  loading = false,
}: KpiCardProps) {
  if (loading) {
    return (
      <div className="bg-[#0d1117] border border-[#1e2433] rounded-xl p-4 border-l-2 border-l-gray-700 space-y-3">
        <div className="skeleton-shimmer h-3 w-24 rounded" />
        <div className="skeleton-shimmer h-8 w-32 rounded" />
        <div className="skeleton-shimmer h-3 w-20 rounded" />
      </div>
    )
  }

  const isPositive = change !== undefined && change >= 0
  const isNeutral = change === undefined

  return (
    <div
      className={`group bg-[#0d1117] border border-[#1e2433] rounded-xl p-4 border-l-2 ${colorMap[color]} hover:-translate-y-0.5 transition-transform duration-150 cursor-default`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider truncate">{title}</p>
        {icon && (
          <span className="text-gray-600 shrink-0">{icon}</span>
        )}
      </div>

      <p className="mt-2 text-2xl font-bold text-white tracking-tight leading-none">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {!isNeutral && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              isPositive ? 'text-[#62d070]' : 'text-red-400'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={12} strokeWidth={2.5} />
            ) : (
              <ArrowDownRight size={12} strokeWidth={2.5} />
            )}
            {Math.abs(change!).toFixed(1)}%
          </span>
        )}
        {subtext && (
          <span className="text-xs text-gray-500 truncate">{subtext}</span>
        )}
      </div>
    </div>
  )
}
