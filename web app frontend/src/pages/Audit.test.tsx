import { screen, waitFor } from '@testing-library/react'
import { beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import Audit from '@/pages/Audit'
import { adminUser, AUDIT_LOGS, pageResponse } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { http, HttpResponse } from 'msw'

describe('Audit', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/admin/audit', ({ request }) => HttpResponse.json(pageResponse(AUDIT_LOGS, request)))
    )
  })
  it('renders the page title and export button', async () => {
    renderWithProviders(<Audit />, { user: adminUser, initialEntries: ['/audit'] })

    expect(screen.getByText('Audit log')).toBeInTheDocument()
    expect(screen.getByText('Immutable record of all administrative actions')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
    })
  })

  it('renders audit entries in the table', async () => {
    renderWithProviders(<Audit />, { user: adminUser, initialEntries: ['/audit'] })

    await waitFor(() => {
      expect(screen.getByText('user.activate')).toBeInTheDocument()
      expect(screen.getByText('partner.approve')).toBeInTheDocument()
    })
  })

  it('filters audit entries by search query', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Audit />, { user: adminUser, initialEntries: ['/audit'] })

    await waitFor(() => {
      expect(screen.getByText('user.activate')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search action, entity, or actor')
    await user.type(searchInput, 'partner.approve')

    await waitFor(() => {
      expect(screen.getByText('partner.approve')).toBeInTheDocument()
      expect(screen.queryByText('user.activate')).not.toBeInTheDocument()
    })
  })

  it('opens details drawer when details button is clicked', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Audit />, { user: adminUser, initialEntries: ['/audit'] })

    await waitFor(() => {
      expect(screen.getByText('user.activate')).toBeInTheDocument()
    })

    const detailsButtons = screen.getAllByRole('button', { name: /details/i })
    if (detailsButtons.length > 0) {
      fireEvent.click(detailsButtons[0])
    }

    await waitFor(() => {
      expect(screen.getByText('Audit entry details')).toBeInTheDocument()
    })
  })

  it('closes details drawer when close is clicked', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Audit />, { user: adminUser, initialEntries: ['/audit'] })

    await waitFor(() => {
      expect(screen.getByText('user.activate')).toBeInTheDocument()
    })

    const detailsButtons = screen.getAllByRole('button', { name: /details/i })
    if (detailsButtons.length > 0) {
      fireEvent.click(detailsButtons[0])
    }

    await waitFor(() => {
      expect(screen.getByText('Audit entry details')).toBeInTheDocument()
    })

    const closeBtn = screen.getAllByRole('button', { name: /close/i })[0]
    await user.click(closeBtn)

    await waitFor(() => {
      expect(screen.queryByText('Audit entry details')).not.toBeInTheDocument()
    })
  })

  it('displays audit entry details in the drawer', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Audit />, { user: adminUser, initialEntries: ['/audit'] })

    await waitFor(() => {
      expect(screen.getByText('user.activate')).toBeInTheDocument()
    })

    const detailsButtons = screen.getAllByRole('button', { name: /details/i })
    if (detailsButtons.length > 0) {
      fireEvent.click(detailsButtons[0])
    }

    await waitFor(() => {
      expect(screen.getByText('Audit entry details')).toBeInTheDocument()
    })

    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getAllByText('Action').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Entity').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Actor').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Result').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Created').length).toBeGreaterThan(0)
  })

  it('renders loading state while fetching', () => {
    server.use(
      http.get('/api/admin/audit', () => new HttpResponse(null, { status: 503 }))
    )

    renderWithProviders(<Audit />, { user: adminUser, initialEntries: ['/audit'] })

    expect(screen.getByText('Audit log')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
  })

  it('renders empty state when no audit logs', async () => {
    server.use(
      http.get('/api/admin/audit', ({ request }) => HttpResponse.json(pageResponse([], request)))
    )

    renderWithProviders(<Audit />, { user: adminUser, initialEntries: ['/audit'] })

    await waitFor(() => {
      expect(screen.getByText('Entries')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('No results.')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('renders actor badges correctly', async () => {
    server.use(
      http.get('/api/admin/audit', ({ request }) => HttpResponse.json(pageResponse(AUDIT_LOGS, request)))
    )

    renderWithProviders(<Audit />, { user: adminUser, initialEntries: ['/audit'] })

    await waitFor(() => {
      expect(screen.getByText('user.activate')).toBeInTheDocument()
    })

    expect(screen.getAllByText('ADMIN').length).toBeGreaterThan(0)
    expect(screen.getAllByText('SYSTEM').length).toBeGreaterThan(0)
  })

  it('renders result badges with correct styles', async () => {
    server.use(
      http.get('/api/admin/audit', ({ request }) => HttpResponse.json(pageResponse(AUDIT_LOGS, request)))
    )

    renderWithProviders(<Audit />, { user: adminUser, initialEntries: ['/audit'] })

    await waitFor(() => {
      expect(screen.getByText('user.activate')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getAllByText('success').length).toBeGreaterThan(0)
    })
  })

  it('renders the search input with correct placeholder', async () => {
    renderWithProviders(<Audit />, { user: adminUser, initialEntries: ['/audit'] })

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search action, entity, or actor')).toBeInTheDocument()
    })
  })

  it('exports CSV on clicking export button', async () => {
    const user = userEvent.setup()
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL

    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()

    renderWithProviders(<Audit />, { user: adminUser, initialEntries: ['/audit'] })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /export csv/i }))

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled()
    })

    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
  })
})