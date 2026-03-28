import { useState, useRef, useEffect } from 'react'
import { User, ChevronDown, Search } from 'lucide-react'
import { useUsers } from '@/hooks/useUsers'
import { useUserStore } from '@/store/userStore'

export function UserSelector() {
  const { data: users = [], isLoading } = useUsers()
  const { currentUser, setCurrentUser } = useUserStore()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-300 hover:border-slate-600 hover:text-white transition-all"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600/30">
          <User className="h-3.5 w-3.5 text-violet-400" />
        </div>
        <span className="max-w-[100px] truncate">{currentUser ? currentUser.name : 'Select user'}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-slate-700/60 bg-slate-900 shadow-2xl shadow-black/50 z-50 scale-in overflow-hidden">
          <div className="p-2 border-b border-slate-800">
            <div className="flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-1.5">
              <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…"
                className="bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none w-full"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
            {isLoading ? (
              <p className="px-3 py-4 text-center text-xs text-slate-500">Loading…</p>
            ) : filtered.length === 0 ? (
              <p className="px-3 py-4 text-center text-xs text-slate-500">No users found</p>
            ) : (
              filtered.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setCurrentUser(u); setOpen(false); setSearch('') }}
                  className={[
                    'w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-left transition-colors',
                    currentUser?.id === u.id
                      ? 'bg-violet-600/20 text-violet-300'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  ].join(' ')}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-xs font-medium text-slate-300 shrink-0">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{u.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
