import { useCallback, useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { useAxiosNavigate } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import AdminGuard from '@/components/AdminGuard'
import Login from '@/pages/Login'
import Overview from '@/pages/Overview'
import Users from '@/pages/Users'
import Partners from '@/pages/Partners'
import PartnerDetail from '@/pages/PartnerDetail'
import Pickups from '@/pages/Pickups'
import Audit from '@/pages/Audit'
import Health from '@/pages/Health'
import AppLayout from '@/components/AppLayout'

import NotFound from '@/pages/NotFound'

function App() {
  const { setUser, logout } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [validationError, setValidationError] = useState<string | null>(null)
  const navigate = useNavigate()
  useAxiosNavigate()

  const redirectToLogin = useCallback(() => {
    if (!window.location.pathname.startsWith('/login')) {
      navigate('/login')
    }
  }, [navigate])

  const validateSession = useCallback(async () => {
    setLoading(true)
    setValidationError(null)
    try {
      const res = await api.get('/auth/me')
      if (res.data?.role === 'ADMIN') {
        setUser(res.data)
      } else {
        logout()
        try {
          await api.post('/auth/logout')
        } catch {
          // ignore
        }
        redirectToLogin()
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        // The shared API interceptor is the sole owner of 401 handling: it clears
        // auth state, query data, and redirects. Avoid a competing navigation here.
      } else {
        const msg = err.response?.status
          ? `Server error (${err.response.status})`
          : 'Network error — please check your connection.'
        setValidationError(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [logout, redirectToLogin, setUser])

  useEffect(() => {
    void validateSession()
  }, [validateSession])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="w-16 h-2 bg-surface-2 rounded" />
      </div>
    )
  }

  if (validationError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-paper gap-4 px-6">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-ink-1 mb-2">
            Unable to verify your session
          </h2>
          <p className="text-ink-2 text-sm mb-6">{validationError}</p>
          <button
            onClick={validateSession}
            className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 active:bg-primary/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <AdminGuard>
            <AppLayout />
          </AdminGuard>
        }
      >
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="users" element={<Users />} />
        <Route path="partners" element={<Partners />} />
        <Route path="partners/:id" element={<PartnerDetail />} />
        <Route path="pickups" element={<Pickups />} />
        <Route path="audit" element={<Audit />} />
        <Route path="health" element={<Health />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
