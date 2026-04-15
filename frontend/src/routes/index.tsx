import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { RequireAuth } from '@/components/RequireAuth'
import { Dashboard } from '@/pages/Dashboard'
import { AuctionsPage } from '@/pages/AuctionsPage'
import { AuctionDetailPage } from '@/pages/AuctionDetailPage'
import { CreateAuctionPage } from '@/pages/CreateAuctionPage'
import { LoginPage } from '@/pages/LoginPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: '/',
    element: <RequireAuth><Layout><Dashboard /></Layout></RequireAuth>,
  },
  {
    path: '/auctions',
    element: <RequireAuth><Layout><AuctionsPage /></Layout></RequireAuth>,
  },
  {
    path: '/auctions/new',
    element: <RequireAuth><Layout><CreateAuctionPage /></Layout></RequireAuth>,
  },
  {
    path: '/auctions/:id',
    element: <RequireAuth><Layout><AuctionDetailPage /></Layout></RequireAuth>,
  },
])
