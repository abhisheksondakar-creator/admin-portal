import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import Login from '@/pages/Login'
import { useAuthStore } from '@/store/auth'
import { server } from '@/test/msw/server'
import { http, HttpResponse } from 'msw'

const adminUser = {
  id: 'a1b2c3d4',
  email: 'admin@ecoloop.app',
  name: 'Admin User',
  role: 'ADMIN',
  active: true,
  pointsBalance: 150,
  createdAt: '2026-01-15T10:30:00.000Z',
}

describe('Login', () => {
  it('renders the login form with email and password fields', () => {
    renderWithProviders(<Login />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('/api/auth/login', async () => HttpResponse.json(adminUser))
    )

    renderWithProviders(<Login />)

    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('submits valid credentials and navigates to overview on admin login', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    server.use(
      http.post('/api/auth/login', async () => HttpResponse.json(adminUser))
    )

    await user.type(screen.getByLabelText(/email/i), 'admin@ecoloop.app')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(useAuthStore.getState().user).not.toBeNull()
      expect(useAuthStore.getState().user?.email).toBe('admin@ecoloop.app')
    })
  })

  it('shows "Admin access required" error for non-admin users', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    server.use(
      http.post('/api/auth/login', async () => {
        return HttpResponse.json({
          id: 'user1',
          email: 'household@ecoloop.app',
          name: 'Household User',
          role: 'HOUSEHOLD',
          active: true,
          pointsBalance: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
        })
      })
    )

    await user.type(screen.getByLabelText(/email/i), 'household@ecoloop.app')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/admin access required/i)).toBeInTheDocument()
    })
  })

  it('shows error message for invalid credentials', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json(
          { status: 401, error: 'Unauthorized', message: 'Invalid email or password' },
          { status: 401 }
        )
      })
    )

    await user.type(screen.getByLabelText(/email/i), 'admin@ecoloop.app')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
    })
  })

  it('shows "Signing in" text while submitting', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)

    server.use(
      http.post('/api/auth/login', async () => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        return HttpResponse.json(adminUser)
      })
    )

    await user.type(screen.getByLabelText(/email/i), 'admin@ecoloop.app')
    await user.type(screen.getByLabelText(/password/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)

    expect(submitButton).toBeDisabled()
    expect(screen.getByText('Signing in')).toBeInTheDocument()
  })
})