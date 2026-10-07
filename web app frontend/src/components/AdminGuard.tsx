import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
