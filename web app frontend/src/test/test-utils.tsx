import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/toast'
import { useAuthStore } from '@/store/auth'
import { User } from '@/store/auth'

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  })
}

export interface TestProviderProps {
  initialEntries?: MemoryRouterProps['initialEntries']
  initialIndex?: number
  user?: User | null
}

export function AllTheProviders({
  children,
  initialEntries = ['/'],
  user = null,
}: React.PropsWithChildren<TestProviderProps>) {
  const queryClient = createTestQueryClient()

  React.useEffect(() => {
    if (user) {
      useAuthStore.getState().setUser(user)
    } else {
      useAuthStore.getState().logout()
    }
  }, [user])

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <ToastProvider>{children}</ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ['/'],
    user = null,
    ...renderOptions
  }: TestProviderProps & Omit<RenderOptions, 'queries'> = {}
) {
  if (user) {
    useAuthStore.setState({ user })
  } else {
    useAuthStore.setState({ user: null })
  }

  return render(ui, {
    wrapper: (({ children }) => (
      <AllTheProviders initialEntries={initialEntries} user={user}>
        {children}
      </AllTheProviders>
    )) as React.ComponentType<{ children: React.ReactNode }>,
    ...renderOptions,
  })
}
