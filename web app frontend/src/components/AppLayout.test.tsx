import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import AppLayout from '@/components/AppLayout'
import { adminUser } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { http, HttpResponse } from 'msw'

describe('AppLayout', () => {
  const routerInitial = ['/overview']

  it('renders navigation items', () => {
    renderWithProviders(<AppLayout />, { user: adminUser, initialEntries: routerInitial })

    expect(screen.getByRole('link', { name: /overview/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /users/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /partners/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /pickups/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /audit/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /health/i })).toBeInTheDocument()
  })

  it('displays the current user name and email', () => {
    renderWithProviders(<AppLayout />, { user: adminUser, initialEntries: routerInitial })

    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.getByText('admin@ecoloop.app')).toBeInTheDocument()
  })

  it('highlights the active navigation item', () => {
    renderWithProviders(<AppLayout />, { user: adminUser, initialEntries: ['/users'] })

    const usersLink = screen.getByRole('link', { name: /users/i })
    expect(usersLink).toHaveClass('bg-surface-2', 'text-ink', 'font-medium')
  })

  it('logs out and redirects to /login when sign out is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AppLayout />, { user: adminUser, initialEntries: routerInitial })

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutButton)

    await waitFor(() => {
      expect(screen.queryByText('Admin User')).not.toBeInTheDocument()
    })
  })

  it('shows loading state on sign out button while mutation is pending', async () => {
    const user = userEvent.setup()
    let resolveLogout: (value: unknown) => void
    const logoutPromise = new Promise((resolve) => {
      resolveLogout = resolve
    })

    server.use(
      http.post('/api/auth/logout', async () => {
        await new Promise((r) => setTimeout(r, 500))
        resolveLogout(null)
        return new HttpResponse(null, { status: 204 })
      })
    )

    renderWithProviders(<AppLayout />, { user: adminUser, initialEntries: routerInitial })

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutButton)

    await waitFor(() => {
      expect(signOutButton).toBeDisabled()
    })

    void logoutPromise
  })
})