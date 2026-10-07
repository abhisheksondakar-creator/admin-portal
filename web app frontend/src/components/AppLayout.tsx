import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Handshake,
  Truck,
  ScrollText,
  Activity,
  LogOut,
} from 'lucide-react'
import { api } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import { useMutation } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/partners', label: 'Partners', icon: Handshake },
  { to: '/pickups', label: 'Pickups', icon: Truck },
  { to: '/audit', label: 'Audit', icon: ScrollText },
  { to: '/health', label: 'Health', icon: Activity },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
    },
    onSuccess: () => {
      logout()
      navigate('/login')
    },
  })

  return (
    <div className="min-h-screen bg-paper flex">
      <aside className="w-60 border-r border-border bg-surface flex flex-col">
        <div className="h-14 px-5 border-b border-border flex items-center gap-2">
          <img src="/logo.jpg" alt="ECOLOOP Logo" className="w-6 h-6 object-contain rounded-sm" />
          <span className="font-semibold text-ink tracking-tight">ECOLOOP</span>
        </div>

        <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-3 py-2 text-sm rounded-btn transition-colors',
                  isActive
                    ? 'bg-surface-2 text-ink font-medium'
                    : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                )
              }
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-3 space-y-2">
          <div className="px-2 py-1.5">
            <div className="text-sm font-medium text-ink truncate">
              {user?.name}
            </div>
            <div className="text-xs text-ink-muted truncate">
              {user?.email}
            </div>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink-muted hover:bg-surface-2 hover:text-ink rounded-btn transition-colors disabled:opacity-50"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="mx-auto max-w-[1400px] px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
