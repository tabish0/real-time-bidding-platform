import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Calendar, User, RefreshCw, Share2 } from 'lucide-react'
import { format } from 'date-fns'
import { useAuction } from '@/hooks/useAuctions'
import { useBids } from '@/hooks/useBids'
import { useAuctionSocket } from '@/hooks/useAuctionSocket'
import { useUserStore } from '@/store/userStore'
import { toast } from '@/store/toastStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { CountdownTimer } from '@/components/CountdownTimer'
import { BidHistory } from '@/components/BidHistory'
import { BidForm } from '@/components/BidForm'
import { useQueryClient } from '@tanstack/react-query'
import { auctionKeys } from '@/hooks/useAuctions'

export function AuctionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { currentUser } = useUserStore()

  const { data: auction, isLoading: auctionLoading, error: auctionError } = useAuction(id!)
  const { data: bids = [], isLoading: bidsLoading } = useBids(id!)
  useAuctionSocket(id!)

  function handleRefresh() {
    qc.invalidateQueries({ queryKey: auctionKeys.detail(id!) })
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast('info', 'Link copied!', 'Auction link is in your clipboard.')
    })
  }

  if (auctionLoading) {
    return (
      <div className="space-y-6 mx-auto max-w-5xl">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (auctionError || !auction) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-semibold text-slate-300">Auction not found</p>
        <p className="mt-2 text-sm text-slate-500">This auction may have been removed or doesn't exist.</p>
        <Button className="mt-6" onClick={() => navigate('/auctions')}>
          Back to Auctions
        </Button>
      </div>
    )
  }

  const currentBid    = auction.currentHighestBid ?? auction.startingPrice
  const hasActiveBid  = auction.currentHighestBid !== null
  const bidIncrement  = hasActiveBid
    ? ((auction.currentHighestBid! - auction.startingPrice) / auction.startingPrice) * 100
    : 0
  const highestBidder = bids[0]?.user?.name

  return (
    <div className="mx-auto max-w-5xl space-y-6 fade-in-up">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} leftIcon={<Share2 className="h-3.5 w-3.5" />}>
            Share
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Auction details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title card */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-white leading-snug">{auction.name}</h1>
              <Badge status={auction.status} dot={auction.status === 'active'}>
                {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
              </Badge>
            </div>

            <p className="text-slate-400 leading-relaxed">{auction.description}</p>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-800 pt-5">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Start time</p>
                <div className="flex items-center gap-1.5 text-sm text-slate-300">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  {format(new Date(auction.startsAt), 'MMM d, yyyy · HH:mm')}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">End time</p>
                <div className="flex items-center gap-1.5 text-sm text-slate-300">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  {format(new Date(auction.endsAt), 'MMM d, yyyy · HH:mm')}
                </div>
              </div>
            </div>
          </div>

          {/* Bid price hero */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  {hasActiveBid ? 'Current highest bid' : 'Starting price'}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white tabular-nums">
                    ${currentBid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  {hasActiveBid && bidIncrement > 0 && (
                    <span className="flex items-center gap-1 text-sm font-semibold text-emerald-400">
                      <TrendingUp className="h-4 w-4" />
                      +{bidIncrement.toFixed(1)}%
                    </span>
                  )}
                </div>
                {hasActiveBid && (
                  <p className="mt-1 text-xs text-slate-600">
                    Starting price: ${auction.startingPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                )}
                {highestBidder && (
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
                    <User className="h-3.5 w-3.5" />
                    Highest bidder: <span className="text-violet-300 font-medium">{highestBidder}</span>
                  </div>
                )}
              </div>

              {/* Countdown */}
              <div className="shrink-0">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Time remaining</p>
                <CountdownTimer endsAt={auction.endsAt} status={auction.status} />
              </div>
            </div>
          </div>

          {/* Bid history */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Bid History</h2>
              <span className="text-sm text-slate-500">{bids.length} bid{bids.length !== 1 ? 's' : ''}</span>
            </div>
            <BidHistory bids={bids} isLoading={bidsLoading} currentUserId={currentUser?.id} />
          </div>
        </div>

        {/* Right: Bid form (sticky) */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-white">Place a Bid</h2>
              <p className="text-sm text-slate-500 mt-0.5">Real-time — others see your bid instantly</p>
            </div>
            <BidForm auction={auction} />
          </div>

          {/* Auction info mini card */}
          <div className="mt-4 glass-card rounded-2xl p-4 space-y-2">
            <h3 className="text-sm font-medium text-slate-300">Auction info</h3>
            <div className="space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Total bids</span>
                <span className="text-slate-300">{bids.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Listed</span>
                <span className="text-slate-300">{format(new Date(auction.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
