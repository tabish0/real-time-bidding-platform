import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gavel, Search, PlusCircle, SlidersHorizontal } from 'lucide-react'
import { useAuctions } from '@/hooks/useAuctions'
import { AuctionCard } from '@/components/AuctionCard'
import { Button } from '@/components/ui/Button'
import { AuctionCardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import type { AuctionStatus } from '@/types'

const STATUS_FILTERS: { label: string; value: AuctionStatus | '' }[] = [
  { label: 'All',       value: '' },
  { label: 'Active',    value: 'active' },
  { label: 'Ended',     value: 'ended' },
  { label: 'Cancelled', value: 'cancelled' },
]

const PAGE_SIZE = 12

export function AuctionsPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<AuctionStatus | ''>('')
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(1)

  const { data: result, isLoading } = useAuctions({
    status: statusFilter || undefined,
    page,
    limit: PAGE_SIZE,
  })

  const auctions = result?.data ?? []
  const totalPages = result?.totalPages ?? 1
  const total = result?.total ?? 0

  // Client-side name filter
  const filtered = search.trim()
    ? auctions.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()))
    : auctions

  function handleStatusChange(val: AuctionStatus | '') {
    setStatusFilter(val)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Auctions</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLoading ? 'Loading…' : `${total} auction${total !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <Button
          onClick={() => navigate('/auctions/new')}
          leftIcon={<PlusCircle className="h-4 w-4" />}
        >
          New Auction
        </Button>
      </div>

      {/* Filters bar */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search auctions…"
              className="w-full rounded-lg border border-slate-700/80 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-4 w-4 text-slate-500 shrink-0" />
            <div className="flex rounded-lg border border-slate-700/60 overflow-hidden">
              {STATUS_FILTERS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => handleStatusChange(value)}
                  className={[
                    'px-3 py-2 text-sm font-medium transition-all',
                    statusFilter === value
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <AuctionCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Gavel className="h-8 w-8" />}
          title={search ? 'No matches found' : 'No auctions here'}
          description={
            search
              ? `Try a different search term or clear the filter.`
              : `There are no ${statusFilter.toLowerCase() || ''} auctions yet.`
          }
          action={
            !search && (
              <Button onClick={() => navigate('/auctions/new')} leftIcon={<PlusCircle className="h-4 w-4" />}>
                Create Auction
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={[
                    'h-8 w-8 rounded-lg text-sm font-medium transition-all',
                    page === p
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
                  ].join(' ')}
                >
                  {p}
                </button>
              )
            })}
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
