import { Gavel } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export function LoginPage() {
  function handleGoogleLogin() {
    window.location.href = `${API_BASE}/auth/google`
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-violet-900/20 blur-3xl" />
        <div className="absolute top-1/2 -right-40 h-80 w-80 rounded-full bg-blue-900/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-violet-900/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-slate-800/60 bg-slate-900/80 backdrop-blur-sm p-8 shadow-2xl shadow-black/50 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 shadow-lg shadow-violet-900/50">
              <Gavel className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Bid<span className="text-gradient">Nest</span>
            </span>
          </div>

          <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-slate-400 mb-8">Sign in to start bidding on live auctions</p>

          {/* Google Sign-in button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-sm"
          >
            {/* Google icon */}
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-xs text-slate-500">
            By signing in you agree to our terms of service
          </p>
        </div>
      </div>
    </div>
  )
}
