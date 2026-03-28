import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchAuctions, fetchAuction, createAuction } from '@/api'
import type { GetAuctionsParams, CreateAuctionPayload } from '@/types'
import { toast } from '@/store/toastStore'

export const auctionKeys = {
  all: ['auctions'] as const,
  lists: () => [...auctionKeys.all, 'list'] as const,
  list: (params: GetAuctionsParams) => [...auctionKeys.lists(), params] as const,
  detail: (id: string) => [...auctionKeys.all, 'detail', id] as const,
}

export function useAuctions(params: GetAuctionsParams = {}) {
  return useQuery({
    queryKey: auctionKeys.list(params),
    queryFn: () => fetchAuctions(params),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

export function useAuction(id: string) {
  return useQuery({
    queryKey: auctionKeys.detail(id),
    queryFn: () => fetchAuction(id),
    staleTime: 15_000,
    refetchInterval: 30_000,
    enabled: Boolean(id),
  })
}

export function useCreateAuction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAuctionPayload) => createAuction(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: auctionKeys.lists() })
      toast('success', 'Auction created', 'Your auction is now live.')
    },
    onError: (err: { message: string | string[] }) => {
      const msg = Array.isArray(err.message) ? err.message.join(', ') : err.message
      toast('error', 'Failed to create auction', msg)
    },
  })
}
