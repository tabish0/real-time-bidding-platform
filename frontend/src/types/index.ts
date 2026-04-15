export type AuctionStatus = 'active' | 'ended'

export interface User {
  id: string
  name: string
  email: string
  picture: string | null
  createdAt: string
}

export interface Auction {
  id: string
  name: string
  description: string
  startingPrice: number
  currentHighestBid: number | null
  startsAt: string
  endsAt: string
  status: AuctionStatus
  createdAt: string
  updatedAt: string
}

export interface Bid {
  id: string
  auctionId: string
  userId: string
  user?: User
  amount: number
  createdAt: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
}

export interface ApiError {
  statusCode: number
  timestamp: string
  path: string
  method: string
  message: string | string[]
}

export interface CreateAuctionPayload {
  name: string
  description: string
  startingPrice: number
  durationHours: number
}

export interface PlaceBidPayload {
  amount: number
}

export interface GetAuctionsParams {
  status?: AuctionStatus
  page?: number
  limit?: number
}

export interface BidPlacedEvent {
  id: string
  userId: string
  userName: string
  amount: number
  createdAt: string
}
