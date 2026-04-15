import { NavLink, useNavigate } from 'react-router-dom'
import { Gavel, LayoutDashboard, PlusCircle, Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

const navLinks = [
  { to: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { to: '/auctions', label: 'Auctions',  icon: Gavel },
]

export function Navbar() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, clearAuth } = useAuthStore()

  function handleLogout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/60 glass-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-white hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 shadow-lg shadow-violet-900/50">
              <Gavel className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Bid<span className="text-gradient">Now</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
                  ].join(' ')
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* New Auction button */}
            <button
              onClick={() => navigate('/auctions/new')}
              className="hidden md:flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-900/30"
            >
              <PlusCircle className="h-4 w-4" />
              New Auction
            </button>

            {/* User avatar + logout */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2">
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/30 text-xs font-medium text-violet-300">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:block max-w-[120px] truncate text-sm text-slate-300">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="flex items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/80 p-2 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 pb-4 border-t border-slate-800 flex flex-col gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-violet-600/20 text-violet-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60',
                  ].join(' ')
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <button
              onClick={() => { navigate('/auctions/new'); setMobileOpen(false) }}
              className="mt-2 flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white w-full"
            >
              <PlusCircle className="h-4 w-4" />
              New Auction
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
