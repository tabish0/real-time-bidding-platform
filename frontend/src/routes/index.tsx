import type { ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { AuctionsPage } from '@/pages/AuctionsPage'
import { AuctionDetailPage } from '@/pages/AuctionDetailPage'
import { CreateAuctionPage } from '@/pages/CreateAuctionPage'
import { LoginPage } from '@/pages/LoginPage'
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'
import { useAuthStore } from '@/store/authStore'

function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

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
