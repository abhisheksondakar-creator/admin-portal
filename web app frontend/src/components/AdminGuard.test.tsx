import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/test-utils'
import AdminGuard from '@/components/AdminGuard'
import { adminUser, householdUser } from '@/test/msw/handlers'

describe('AdminGuard', () => {
  it('redirects to /login when user is not authenticated', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <AdminGuard>
              <div>Protected content</div>
            </AdminGuard>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { user: null, initialEntries: ['/'] }
    )

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('allows rendering children when user is ADMIN', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <AdminGuard>
              <div>Protected content</div>
            </AdminGuard>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { user: adminUser, initialEntries: ['/'] }
    )

    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('redirects to /login when user is not ADMIN (HOUSEHOLD)', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <AdminGuard>
              <div>Protected content</div>
            </AdminGuard>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>,
      { user: householdUser, initialEntries: ['/'] }
    )

    expect(screen.queryByText('Protected content')).not.toBeInTheDocument()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
