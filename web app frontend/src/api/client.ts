import axios from 'axios'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ?? (import.meta.env.PROD ? 'https://new-ecoloop-backend.onrender.com/api' : '/api'),
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    Accept: 'application/json',
  },
})

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'))
  return match ? decodeURIComponent(match[3]) : null
}

let csrfPromise: Promise<string | null> | null = null

export async function bootstrapCsrf(): Promise<string | null> {
  const existing = getCookie('XSRF-TOKEN')
  if (existing) return existing

  if (!csrfPromise) {
    csrfPromise = api
      .get('/auth/csrf')
      .then((res) => {
        csrfPromise = null
        return (res.data?.token as string) || getCookie('XSRF-TOKEN')
      })
      .catch(() => {
        csrfPromise = null
        return null
      })
  }
  return csrfPromise
}

api.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase()
  if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    let token = getCookie('XSRF-TOKEN')
    if (!token && !config.url?.includes('/auth/csrf')) {
      token = await bootstrapCsrf()
    }
    if (token && (!config.headers || !config.headers['X-XSRF-TOKEN'])) {
      config.headers = config.headers || {}
      config.headers['X-XSRF-TOKEN'] = token
    }
  }
  return config
})

let navigate: ((path: string) => void) | null = null
let onUnauthorizedCallback: (() => void) | null = null

export function setApiNavigate(fn: (path: string) => void) {
  navigate = fn
}

export function setOnUnauthorized(fn: () => void) {
  onUnauthorizedCallback = fn
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback()
      }
      if (navigate) {
        navigate('/login')
      }
    }
    return Promise.reject(err)
  }
)

export function useAxiosNavigate() {
  const nav = useNavigate()
  useEffect(() => {
    setApiNavigate(nav)
  }, [nav])
}
