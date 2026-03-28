import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import type { BidPlacedEvent, Bid, Auction } from '@/types'
import { bidKeys } from './useBids'
import { auctionKeys } from './useAuctions'

const WS_URL = import.meta.env.VITE_WS_BASE_URL ?? 'http://localhost:3000'

let sharedSocket: Socket | null = null

function getSocket(): Socket {
  if (!sharedSocket || !sharedSocket.connected) {
    sharedSocket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })
  }
  return sharedSocket
}

export function useAuctionSocket(auctionId: string) {
  const qc = useQueryClient()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!auctionId) return

    const socket = getSocket()
    socketRef.current = socket

    socket.emit('join-auction', auctionId)

    const handleBidPlaced = (event: BidPlacedEvent) => {
      // Inject the new bid into the bids cache
      const newBid: Bid = {
        id: event.id,
        auctionId,
        userId: event.userId,
        user: { id: event.userId, name: event.userName, createdAt: event.createdAt },
        amount: event.amount,
        createdAt: event.createdAt,
      }

      qc.setQueryData<Bid[]>(bidKeys.list(auctionId), (old = []) => {
        // Avoid duplicates if REST mutation already added it
        if (old.some((b) => b.id === event.id)) return old
        return [newBid, ...old]
      })

      // Update currentHighestBid on the auction detail
      qc.setQueryData<Auction>(auctionKeys.detail(auctionId), (old) => {
        if (!old) return old
        if (event.amount > (old.currentHighestBid ?? 0)) {
          return { ...old, currentHighestBid: event.amount }
        }
        return old
      })

      // Also invalidate the auction list so cards update
      qc.invalidateQueries({ queryKey: auctionKeys.lists() })
    }

    socket.on('bid-placed', handleBidPlaced)

    return () => {
      socket.emit('leave-auction', auctionId)
      socket.off('bid-placed', handleBidPlaced)
    }
  }, [auctionId, qc])
}
