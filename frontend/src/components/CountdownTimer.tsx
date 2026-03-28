import { Clock } from 'lucide-react'
import { useCountdown } from '@/hooks/useCountdown'
import type { AuctionStatus } from '@/types'

interface CountdownTimerProps {
  endsAt: string
  status: AuctionStatus
  compact?: boolean
}

export function CountdownTimer({ endsAt, status, compact = false }: CountdownTimerProps) {
  const { label, urgency, isExpired, days, hours, minutes, seconds } = useCountdown(endsAt)

  if (status !== 'active') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
        <Clock className="h-3.5 w-3.5" />
        {status === 'ended' ? 'Ended' : 'Cancelled'}
      </span>
    )
  }

  if (compact) {
    return (
      <span
        className={[
          'inline-flex items-center gap-1 text-xs font-semibold tabular-nums',
          isExpired || urgency === 'critical' ? 'text-red-400' : urgency === 'warning' ? 'text-amber-400' : 'text-slate-400',
        ].join(' ')}
      >
        <Clock className="h-3.5 w-3.5 shrink-0" />
        {label}
      </span>
    )
  }

  // Detailed countdown blocks (for detail page)
  const parts =
    days > 0
      ? [{ v: days, unit: 'days' }, { v: hours, unit: 'hrs' }, { v: minutes, unit: 'min' }]
      : hours > 0
      ? [{ v: hours, unit: 'hrs' }, { v: minutes, unit: 'min' }, { v: seconds, unit: 'sec' }]
      : [{ v: minutes, unit: 'min' }, { v: seconds, unit: 'sec' }]

  const colorClass =
    isExpired || urgency === 'critical'
      ? 'text-red-400 border-red-500/20 bg-red-500/10'
      : urgency === 'warning'
      ? 'text-amber-400 border-amber-500/20 bg-amber-500/10'
      : 'text-slate-200 border-slate-700/60 bg-slate-800/60'

  return (
    <div className="flex items-center gap-2">
      <Clock className={`h-4 w-4 ${isExpired || urgency === 'critical' ? 'text-red-400' : urgency === 'warning' ? 'text-amber-400' : 'text-slate-400'}`} />
      <div className="flex items-center gap-1.5">
        {parts.map(({ v, unit }) => (
          <div key={unit} className={`flex flex-col items-center rounded-lg border px-2.5 py-1.5 ${colorClass}`}>
            <span className="text-xl font-bold tabular-nums leading-none">
              {String(v).padStart(2, '0')}
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider opacity-70">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
