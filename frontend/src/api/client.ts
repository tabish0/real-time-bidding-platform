import axios from 'axios'
import type { ApiError } from '@/types'
import { useAuthStore } from '@/store/authStore'

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError: ApiError = error.response?.data ?? {
      statusCode: 0,
      timestamp: new Date().toISOString(),
      path: '',
      method: '',
      message: 'Network error — please check your connection.',
    }
    return Promise.reject(apiError)
  },
)
