import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { AuctionsPage } from '@/pages/AuctionsPage'
import { AuctionDetailPage } from '@/pages/AuctionDetailPage'
import { CreateAuctionPage } from '@/pages/CreateAuctionPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Dashboard /></Layout>,
  },
  {
    path: '/auctions',
    element: <Layout><AuctionsPage /></Layout>,
  },
  {
    path: '/auctions/new',
    element: <Layout><CreateAuctionPage /></Layout>,
  },
  {
    path: '/auctions/:id',
    element: <Layout><AuctionDetailPage /></Layout>,
  },
])
