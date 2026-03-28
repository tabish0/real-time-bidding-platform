import type { ReactNode } from 'react'
import type { AuctionStatus } from '@/types'

type Variant = 'active' | 'ended' | 'info' | 'warning' | 'neutral'

const variantStyles: Record<Variant, string> = {
  active:    'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  ended:     'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30',
  info:      'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30',
  warning:   'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  neutral:   'bg-slate-700/50 text-slate-300 ring-1 ring-slate-600/30',
}

const statusToVariant: Record<AuctionStatus, Variant> = {
  active:    'active',
  ended:     'ended',
}

interface BadgeProps {
  variant?: Variant
  status?: AuctionStatus
  children: ReactNode
  dot?: boolean
  className?: string
}

export function Badge({ variant, status, children, dot = false, className = '' }: BadgeProps) {
  const v = variant ?? (status ? statusToVariant[status] : 'neutral')
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[v],
        className,
      ].join(' ')}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${v === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-current'}`} />
      )}
      {children}
    </span>
  )
}
