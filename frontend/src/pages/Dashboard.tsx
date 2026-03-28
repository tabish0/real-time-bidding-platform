import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gavel, TrendingUp, Clock, CheckCircle, PlusCircle, ArrowRight, Zap } from 'lucide-react'
import { useAuctions } from '@/hooks/useAuctions'
import { AuctionCard } from '@/components/AuctionCard'
import { StatsCard } from '@/components/StatsCard'
import { Button } from '@/components/ui/Button'
import { AuctionCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'

export function Dashboard() {
  const navigate = useNavigate()
  const { data: result, isLoading } = useAuctions({ limit: 100 })

  const allAuctions = useMemo(() => result?.data ?? [], [result])

  const stats = useMemo(() => {
    const active    = allAuctions.filter((a) => a.status === 'active')
    const ended     = allAuctions.filter((a) => a.status === 'ended')
    const withBids  = allAuctions.filter((a) => a.currentHighestBid !== null)
    const totalBids = withBids.reduce((sum, a) => sum + (a.currentHighestBid ?? 0), 0)
    return { active: active.length, ended: ended.length, withBids: withBids.length, totalBids }
  }, [allAuctions])

  const featuredAuctions = useMemo(
    () => allAuctions.filter((a) => a.status === 'active').slice(0, 6),
    [allAuctions],
  )

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-gradient-to-br from-violet-950/50 via-slate-900/80 to-slate-900 px-8 py-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />
          <div className="absolute bottom-0 left-10 h-40 w-40 rounded-full bg-blue-600/10 blur-2xl" />
        </div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
              <Zap className="h-3.5 w-3.5" />
              Live Auction Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Bid. Win.{' '}
              <span className="text-gradient">Collect.</span>
            </h1>
            <p className="mt-3 max-w-md text-base text-slate-400">
              Real-time bidding on exclusive items. Every second counts — don't miss out on the action.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button
              onClick={() => navigate('/auctions/new')}
              leftIcon={<PlusCircle className="h-4 w-4" />}
              size="lg"
            >
              Create Auction
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/auctions')}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              size="lg"
            >
              Browse All
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatsCard
            label="Active Auctions"
            value={isLoading ? '—' : stats.active}
            icon={<Gavel className="h-5 w-5 text-violet-400" />}
            iconBg="bg-violet-600/20"
          />
          <StatsCard
            label="Auctions Ended"
            value={isLoading ? '—' : stats.ended}
            icon={<CheckCircle className="h-5 w-5 text-emerald-400" />}
            iconBg="bg-emerald-600/20"
          />
          <StatsCard
            label="Items with Bids"
            value={isLoading ? '—' : stats.withBids}
            icon={<TrendingUp className="h-5 w-5 text-blue-400" />}
            iconBg="bg-blue-600/20"
          />
          <StatsCard
            label="Total Bid Volume"
            value={isLoading ? '—' : `$${stats.totalBids.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
            icon={<Clock className="h-5 w-5 text-amber-400" />}
            iconBg="bg-amber-600/20"
          />
        </div>
      </section>

      {/* Live auctions */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Live Auctions</h2>
            <p className="mt-0.5 text-sm text-slate-500">Real-time bidding in progress</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auctions')}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            View all
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <AuctionCardSkeleton key={i} />)}
          </div>
        ) : featuredAuctions.length === 0 ? (
          <EmptyState
            icon={<Gavel className="h-8 w-8" />}
            title="No active auctions"
            description="Be the first to create an auction and start the bidding war!"
            action={
              <Button onClick={() => navigate('/auctions/new')} leftIcon={<PlusCircle className="h-4 w-4" />}>
                Create Auction
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
