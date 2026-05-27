type Platform = 'instagram' | 'facebook' | 'tiktok' | 'pinterest' | 'youtube'

interface PlatformBadgeProps {
  platform: Platform
  className?: string
}

const platformConfig: Record<Platform, { label: string; dotColor: string; textColor: string; bg: string }> = {
  instagram: {
    label: 'Instagram',
    dotColor: 'bg-[#fc3467]',
    textColor: 'text-[#fc3467]',
    bg: 'bg-[#fc3467]/10',
  },
  facebook: {
    label: 'Facebook',
    dotColor: 'bg-[#00709c]',
    textColor: 'text-[#75c7e6]',
    bg: 'bg-[#00709c]/10',
  },
  tiktok: {
    label: 'TikTok',
    dotColor: 'bg-white',
    textColor: 'text-white',
    bg: 'bg-white/10',
  },
  pinterest: {
    label: 'Pinterest',
    dotColor: 'bg-red-500',
    textColor: 'text-red-400',
    bg: 'bg-red-500/10',
  },
  youtube: {
    label: 'YouTube',
    dotColor: 'bg-red-600',
    textColor: 'text-red-500',
    bg: 'bg-red-600/10',
  },
}

export function PlatformBadge({ platform, className = '' }: PlatformBadgeProps) {
  const config = platformConfig[platform]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.textColor} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shrink-0`} />
      {config.label}
    </span>
  )
}
