import type { ReactNode } from 'react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: ReactNode
  iconBg?: string
  trend?: { value: string; up?: boolean }
  description?: string
}

export function StatsCard({ label, value, icon, iconBg = 'bg-violet-600/20', trend, description }: StatsCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 fade-in-up">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        {trend && (
          <span
            className={[
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              trend.up !== false ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10',
            ].join(' ')}
          >
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-400">{label}</p>
      {description && <p className="mt-0.5 text-xs text-slate-600">{description}</p>}
    </div>
  )
}
