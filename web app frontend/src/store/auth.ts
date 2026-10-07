import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  role: 'HOUSEHOLD' | 'PARTNER' | 'ADMIN'
  active?: boolean
  pointsBalance: number
  createdAt?: string
  updatedAt?: string
}

interface AuthState {
  user: User | null
  setUser: (u: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      setUser: (u) => set({ user: u }),
      logout: () => set({ user: null }),
    }),
    { name: 'ecoloop-auth' }
  )
)

export function resetAuthStore() {
  useAuthStore.setState({ user: null })
}
