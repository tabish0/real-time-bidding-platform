import { client } from './client'
import type {
  Auction,
  Bid,
  User,
  PaginatedResult,
  ApiResponse,
  CreateAuctionPayload,
  PlaceBidPayload,
  GetAuctionsParams,
} from '@/types'

// PostgreSQL NUMERIC columns come back as strings — coerce them to numbers here
// so the rest of the app can treat all price fields as `number`.
function parseAuction(raw: Auction): Auction {
  return {
    ...raw,
    startingPrice: Number(raw.startingPrice),
    currentHighestBid: raw.currentHighestBid !== null ? Number(raw.currentHighestBid) : null,
  }
}

function parseBid(raw: Bid): Bid {
  return { ...raw, amount: Number(raw.amount) }
}

// ── Auctions ─────────────────────────────────────────────────────────────────

export async function fetchAuctions(params: GetAuctionsParams = {}): Promise<PaginatedResult<Auction>> {
  const { data } = await client.get<ApiResponse<PaginatedResult<Auction>>>('/auctions', { params })
  return { ...data.data, data: data.data.data.map(parseAuction) }
}

export async function fetchAuction(id: string): Promise<Auction> {
  const { data } = await client.get<ApiResponse<Auction>>(`/auctions/${id}`)
  return parseAuction(data.data)
}

export async function createAuction(payload: CreateAuctionPayload): Promise<Auction> {
  const { data } = await client.post<ApiResponse<Auction>>('/auctions', payload)
  return parseAuction(data.data)
}

// ── Bids ─────────────────────────────────────────────────────────────────────

export async function fetchBids(auctionId: string): Promise<Bid[]> {
  const { data } = await client.get<ApiResponse<Bid[]>>(`/auctions/${auctionId}/bids`)
  return data.data.map(parseBid)
}

export async function placeBid(auctionId: string, payload: PlaceBidPayload): Promise<Bid> {
  const { data } = await client.post<ApiResponse<Bid>>(`/auctions/${auctionId}/bids`, payload)
  return parseBid(data.data)
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function fetchUsers(): Promise<User[]> {
  const { data } = await client.get<ApiResponse<User[]>>('/users')
  return data.data
}
