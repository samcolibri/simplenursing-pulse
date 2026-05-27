'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Activity,
  FileText,
  Users,
  TrendingUp,
  Sparkles,
  Settings,
  CheckCircle2,
} from 'lucide-react'

const navItems = [
  { href: '/pulse', label: 'Pulse', icon: Activity, shortcut: 'g+p' },
  { href: '/posts', label: 'Posts', icon: FileText, shortcut: 'g+o' },
  { href: '/competitors', label: 'Competitors', icon: Users, shortcut: 'g+c' },
  { href: '/trends', label: 'Trends', icon: TrendingUp, shortcut: 'g+t' },
  { href: '/recommendations', label: 'AI Recs', icon: Sparkles, shortcut: 'g+r' },
  { href: '/settings', label: 'Settings', icon: Settings, shortcut: 'g+s' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-[220px] min-w-[220px] h-screen bg-[#0d1117] border-r border-[#1e2433] overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-[#1e2433]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#75c7e6] flex items-center justify-center shrink-0">
            <Activity size={14} className="text-[#005374]" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">SN Intelligence</span>
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <span className="live-dot w-1.5 h-1.5 rounded-full bg-[#62d070] block shrink-0" />
          <span className="text-[10px] text-[#62d070] font-medium uppercase tracking-widest">LIVE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, shortcut }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-[#75c7e6]/10 text-[#75c7e6] font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon
                size={16}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'text-[#75c7e6]' : 'text-gray-500 group-hover:text-gray-300'}
              />
              <span className="flex-1">{label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-opacity ${
                  isActive
                    ? 'border-[#75c7e6]/30 text-[#75c7e6]/60 opacity-100'
                    : 'border-[#1e2433] text-gray-600 opacity-0 group-hover:opacity-100'
                }`}
              >
                {shortcut}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Apify status */}
      <div className="px-4 py-4 border-t border-[#1e2433]">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={13} className="text-[#62d070]" />
          <span className="text-xs text-gray-500">Apify connected</span>
        </div>
        <p className="text-[10px] text-gray-600 mt-0.5 pl-[19px]">harmonious_notation</p>
      </div>
    </aside>
  )
}
