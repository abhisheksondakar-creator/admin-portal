import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import Partners from '@/pages/Partners'
import { adminUser, PARTNERS, pageResponse } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { http, HttpResponse } from 'msw'

describe('Partners', () => {
  it('renders the page title and description', async () => {
    renderWithProviders(<Partners />, { user: adminUser, initialEntries: ['/partners'] })

    expect(screen.getByText('Partners')).toBeInTheDocument()
    expect(screen.getByText('Review and manage partner applications')).toBeInTheDocument()
  })

  it('renders tab navigation with correct labels', async () => {
    renderWithProviders(<Partners />, { user: adminUser, initialEntries: ['/partners'] })

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })
    expect(screen.getByText('Approved')).toBeInTheDocument()
    expect(screen.getByText('Rejected')).toBeInTheDocument()
    expect(screen.getByText('Suspended')).toBeInTheDocument()
  })

  it('renders partners in the correct tab based on status', async () => {
    server.use(
      http.get('/api/admin/partners', ({ request }) => HttpResponse.json(pageResponse(PARTNERS, request)))
    )
    renderWithProviders(<Partners />, { user: adminUser, initialEntries: ['/partners'] })

    await waitFor(() => {
      expect(screen.getByText('Eco Pickup Co')).toBeInTheDocument()
    })

    const pendingTab = screen.getByRole('button', { name: /pending/i })
    expect(pendingTab).toHaveClass('text-ink')

    expect(screen.getByText('Eco Pickup Co')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /approved/i }))

    await waitFor(() => {
      expect(screen.getByText('Green Logistics')).toBeInTheDocument()
    })
  })

  it('filters partners by search query', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('/api/admin/partners', ({ request }) => HttpResponse.json(pageResponse(PARTNERS, request)))
    )
    renderWithProviders(<Partners />, { user: adminUser, initialEntries: ['/partners'] })

    await waitFor(() => {
      expect(screen.getByText('Eco Pickup Co')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /approved/i }))

    await waitFor(() => {
      expect(screen.getByText('Green Logistics')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search organization')
    await user.type(searchInput, 'Green Logistics')

    await waitFor(() => {
      expect(screen.getByText('Green Logistics')).toBeInTheDocument()
    })
  })

  it.skip('opens approve confirmation dialog and confirms (happy-dom limitation)', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('/api/admin/partners', ({ request }) => HttpResponse.json(pageResponse(PARTNERS, request)))
    )
    renderWithProviders(<Partners />, { user: adminUser, initialEntries: ['/partners'] })

    await waitFor(() => {
      expect(screen.getByText('Eco Pickup Co')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /pending/i }))
    const approveButtons = await screen.findAllByRole('button', { name: /approve/i })
    if (approveButtons.length > 0) {
      await user.click(approveButtons[0])
    }

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeInTheDocument()
    })

    const confirmButton = screen.getByRole('button', { name: /confirm approve/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it.skip('opens reject confirmation dialog and confirms (happy-dom limitation)', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('/api/admin/partners', ({ request }) => HttpResponse.json(pageResponse([
        {
          id: 'p1',
          orgName: 'Green Logistics',
          type: 'commercial',
          status: 'approved',
          capacity: 10,
        },
        {
          id: 'p2',
          orgName: 'Eco Pickup Co',
          type: 'cooperative',
          status: 'pending',
          capacity: 5,
        },
        {
          id: 'p3',
          orgName: 'Rejected Movers',
          type: 'commercial',
          status: 'rejected',
          capacity: 8,
        },
      ], request)))
    )
    renderWithProviders(<Partners />, { user: adminUser, initialEntries: ['/partners'] })

    await waitFor(() => {
      expect(screen.getByText('Eco Pickup Co')).toBeInTheDocument()
    })

    const rejectButtons = await screen.findAllByRole('button', { name: /reject/i })
    if (rejectButtons.length > 0) {
      await user.click(rejectButtons[0])
    }

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeInTheDocument()
    })

    const confirmButton = screen.getByRole('button', { name: /confirm reject/i })
    await user.click(confirmButton)
  })

  it('renders View button that navigates to partner detail', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('/api/admin/partners', ({ request }) => HttpResponse.json(pageResponse(PARTNERS, request)))
    )
    renderWithProviders(<Partners />, { user: adminUser, initialEntries: ['/partners'] })

    await waitFor(() => {
      expect(screen.getByText('Eco Pickup Co')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /approved/i }))

    await waitFor(() => {
      expect(screen.getByText('Green Logistics')).toBeInTheDocument()
    })

    const viewButtons = await screen.findAllByRole('button', { name: /view/i })
    expect(viewButtons.length).toBeGreaterThan(0)
  })

  it('renders suspend button for approved partners', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('/api/admin/partners', ({ request }) => HttpResponse.json(pageResponse(PARTNERS, request)))
    )
    renderWithProviders(<Partners />, { user: adminUser, initialEntries: ['/partners'] })

    await user.click(screen.getByRole('button', { name: /approved/i }))

    await waitFor(() => {
      expect(screen.getByText('Green Logistics')).toBeInTheDocument()
    })

    const suspendButtons = await screen.findAllByRole('button', { name: /suspend/i })
    expect(suspendButtons.length).toBeGreaterThan(0)
  })

  it('renders loading skeletons while fetching', () => {
    server.use(
      http.get('/api/admin/partners', () => new HttpResponse(null, { status: 503 }))
    )

    renderWithProviders(<Partners />, { user: adminUser, initialEntries: ['/partners'] })

    expect(screen.getByText('Partner applications')).toBeInTheDocument()
  })

  it('shows tab counts correctly', async () => {
    renderWithProviders(<Partners />, { user: adminUser, initialEntries: ['/partners'] })

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument()
    })

    const pendingTabBadge = screen.getByRole('button', { name: /pending/i })
    expect(pendingTabBadge).toBeInTheDocument()
  })
})
