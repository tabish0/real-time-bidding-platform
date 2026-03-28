import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchBids, placeBid } from '@/api'
import type { PlaceBidPayload, Bid } from '@/types'
import { auctionKeys } from './useAuctions'
import { toast } from '@/store/toastStore'

export const bidKeys = {
  all: ['bids'] as const,
  list: (auctionId: string) => [...bidKeys.all, auctionId] as const,
}

export function useBids(auctionId: string) {
  return useQuery({
    queryKey: bidKeys.list(auctionId),
    queryFn: () => fetchBids(auctionId),
    enabled: Boolean(auctionId),
    staleTime: 10_000,
  })
}

export function usePlaceBid(auctionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: PlaceBidPayload) => placeBid(auctionId, payload),
    onSuccess: (newBid: Bid) => {
      // Prepend new bid to the list cache
      qc.setQueryData<Bid[]>(bidKeys.list(auctionId), (old = []) => [newBid, ...old])
      // Refresh the auction so currentHighestBid updates
      qc.invalidateQueries({ queryKey: auctionKeys.detail(auctionId) })
      toast('success', 'Bid placed!', `Your bid of $${newBid.amount.toLocaleString()} was accepted.`)
    },
    onError: (err: { message: string | string[] }) => {
      const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message
      toast('error', 'Bid rejected', msg)
    },
  })
}
