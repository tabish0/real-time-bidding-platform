import { formatDistanceToNow } from 'date-fns'
import { Trophy } from 'lucide-react'
import type { Bid } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

interface BidHistoryProps {
  bids: Bid[]
  isLoading: boolean
  currentUserId?: string
}

export function BidHistory({ bids, isLoading, currentUserId }: BidHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (bids.length === 0) {
    return (
      <EmptyState
        icon={<Trophy className="h-7 w-7" />}
        title="No bids yet"
        description="Be the first to place a bid on this auction!"
      />
    )
  }

  const highestAmount = Math.max(...bids.map((b) => b.amount))

  return (
    <ol className="space-y-2">
      {bids.map((bid) => {
        const isHighest = bid.amount === highestAmount
        const isCurrentUser = bid.userId === currentUserId
        const name = bid.user?.name ?? 'Anonymous'

        return (
          <li
            key={bid.id}
            className={[
              'flex items-center gap-3 rounded-xl px-4 py-3 transition-all',
              isHighest
                ? 'bg-emerald-500/10 border border-emerald-500/20'
                : 'bg-slate-800/40 border border-transparent',
            ].join(' ')}
          >
            {/* Avatar */}
            <div
              className={[
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0',
                isCurrentUser ? 'bg-violet-600/30 text-violet-300' : 'bg-slate-700 text-slate-300',
              ].join(' ')}
            >
              {name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium truncate ${isCurrentUser ? 'text-violet-300' : 'text-slate-200'}`}>
                  {name}
                  {isCurrentUser && <span className="ml-1 text-[10px] font-normal text-violet-400">(you)</span>}
                </span>
                {isHighest && (
                  <Trophy className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* Amount */}
            <span className={`text-sm font-bold tabular-nums ${isHighest ? 'text-emerald-400' : 'text-slate-300'}`}>
              ${bid.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
