import { NavLink, useNavigate } from 'react-router-dom'
import { Gavel, LayoutDashboard, PlusCircle, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { UserSelector } from './UserSelector'

const navLinks = [
  { to: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { to: '/auctions', label: 'Auctions',  icon: Gavel },
]

export function Navbar() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

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
              Bid<span className="text-gradient">Nest</span>
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
            <UserSelector />
            <button
              onClick={() => navigate('/auctions/new')}
              className="hidden md:flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-900/30"
            >
              <PlusCircle className="h-4 w-4" />
              New Auction
            </button>
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
          </div>
        )}
      </div>
    </header>
  )
}
