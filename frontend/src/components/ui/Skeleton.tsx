interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-800/70 ${className}`}
    />
  )
}

export function AuctionCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-9 w-full rounded-lg" />
    </div>
  )
}
