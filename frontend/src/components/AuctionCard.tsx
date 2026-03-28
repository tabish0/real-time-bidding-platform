import { useNavigate } from 'react-router-dom'
import { TrendingUp, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { CountdownTimer } from './CountdownTimer'
import type { Auction } from '@/types'

interface AuctionCardProps {
  auction: Auction
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const navigate = useNavigate()

  const currentBid = auction.currentHighestBid ?? auction.startingPrice
  const hasActiveBid = auction.currentHighestBid !== null
  const bidIncrement = hasActiveBid
    ? ((auction.currentHighestBid! - auction.startingPrice) / auction.startingPrice) * 100
    : 0

  return (
    <article
      onClick={() => navigate(`/auctions/${auction.id}`)}
      className="group glass-card cursor-pointer rounded-2xl p-5 transition-all duration-200 hover:border-violet-500/20 hover:bg-slate-800/50 hover:shadow-lg hover:shadow-violet-900/10 fade-in-up"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-slate-100 leading-snug line-clamp-2 group-hover:text-white transition-colors flex-1">
          {auction.name}
        </h3>
        <Badge status={auction.status} dot={auction.status === 'active'}>
          {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">{auction.description}</p>

      {/* Bid info */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">{hasActiveBid ? 'Current bid' : 'Starting price'}</p>
          <p className="text-2xl font-bold text-slate-100 tabular-nums">
            ${currentBid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        {hasActiveBid && bidIncrement > 0 && (
          <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            +{bidIncrement.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Starting price if there's a current bid */}
      {hasActiveBid && (
        <p className="text-xs text-slate-600 mb-3">
          Starting: ${auction.startingPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800">
        <CountdownTimer endsAt={auction.endsAt} status={auction.status} compact />
        <span className="flex items-center gap-1 text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          View auction <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </article>
  )
}
