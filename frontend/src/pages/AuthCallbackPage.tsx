import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gavel } from 'lucide-react'
import { fetchMe } from '@/api'
import { useAuthStore } from '@/store/authStore'
import { client } from '@/api/client'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')

    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    // Temporarily set the auth header for this request only
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`

    fetchMe()
      .then((user) => {
        setAuth(token, user)
        navigate('/', { replace: true })
      })
      .catch(() => {
        delete client.defaults.headers.common['Authorization']
        navigate('/login', { replace: true })
      })
  }, [navigate, setAuth])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600/20 animate-pulse">
          <Gavel className="h-6 w-6 text-violet-400" />
        </div>
        <p className="text-sm text-slate-400">Signing you in…</p>
      </div>
    </div>
  )
}
