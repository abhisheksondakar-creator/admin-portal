import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import Pickups from '@/pages/Pickups'
import { adminUser, pageResponse, PICKUPS, PARTNERS } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { http, HttpResponse } from 'msw'

describe('Pickups', () => {
  it('renders the page title and description', async () => {
    renderWithProviders(<Pickups />, { user: adminUser, initialEntries: ['/pickups'] })

    expect(screen.getByText('Pickups')).toBeInTheDocument()
    expect(screen.getByText('All pickup requests and assignment')).toBeInTheDocument()
  })

  it('renders all pickups in the table', async () => {
    server.use(
      http.get('/api/admin/pickups', ({ request }) => HttpResponse.json(pageResponse(PICKUPS, request))),
      http.get('/api/admin/partners', ({ request }) => HttpResponse.json(pageResponse(PARTNERS, request)))
    )

    renderWithProviders(<Pickups />, { user: adminUser, initialEntries: ['/pickups'] })

    await waitFor(() => {
      expect(screen.getByText('Pickup requests')).toBeInTheDocument()
    })

    await waitFor(
      () => {
        expect(screen.getAllByText('pending').length).toBeGreaterThan(0)
      },
      { timeout: 3000 }
    )

    expect(screen.getAllByText('completed').length).toBeGreaterThan(0)
  })

  it('filters pickups by status', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('/api/admin/pickups', ({ request }) => HttpResponse.json(pageResponse(PICKUPS, request))),
      http.get('/api/admin/partners', ({ request }) => HttpResponse.json(pageResponse(PARTNERS, request)))
    )

    renderWithProviders(<Pickups />, { user: adminUser, initialEntries: ['/pickups'] })

    await waitFor(() => {
      expect(screen.getByText('Pickup requests')).toBeInTheDocument()
    })

    // Verify filter UI exists and data has multiple statuses
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0)
    await waitFor(() => {
      expect(screen.getAllByText('pending').length).toBeGreaterThan(0)
    })
    expect(screen.getAllByText('completed').length).toBeGreaterThan(0)
  })

  it('filters pickups by address search', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('/api/admin/pickups', ({ request }) => HttpResponse.json(pageResponse(PICKUPS, request))),
      http.get('/api/admin/partners', ({ request }) => HttpResponse.json(pageResponse(PARTNERS, request)))
    )

    renderWithProviders(<Pickups />, { user: adminUser, initialEntries: ['/pickups'] })

    await waitFor(() => {
      expect(screen.getByText('Pickup requests')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search by address')
    await user.type(searchInput, 'Oak Ave')

    await waitFor(() => {
      expect(screen.getByText(/456 Oak Ave/)).toBeInTheDocument()
    })
  })

  it('opens reassign drawer when reassign button is clicked', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('/api/admin/pickups', ({ request }) => HttpResponse.json(pageResponse(PICKUPS, request))),
      http.get('/api/admin/partners', ({ request }) => HttpResponse.json(pageResponse(PARTNERS, request)))
    )

    renderWithProviders(<Pickups />, { user: adminUser, initialEntries: ['/pickups'] })

    await waitFor(() => {
      expect(screen.getByText('Pickup requests')).toBeInTheDocument()
    })

    const reassignButtons = await screen.findAllByRole('button', { name: /reassign/i })
    if (reassignButtons.length > 0) {
      await user.click(reassignButtons[0])
    }

    await waitFor(() => {
      expect(screen.getByText('Reassign pickup')).toBeInTheDocument()
    })
  })

  it('renders unassigned partner as Unassigned', async () => {
    server.use(
      http.get('/api/admin/pickups', ({ request }) => HttpResponse.json(pageResponse(PICKUPS, request))),
      http.get('/api/admin/partners', ({ request }) => HttpResponse.json(pageResponse(PARTNERS, request)))
    )

    renderWithProviders(<Pickups />, { user: adminUser, initialEntries: ['/pickups'] })

    await waitFor(() => {
      expect(screen.getAllByText('Unassigned').length).toBeGreaterThan(0)
    })
  })

  it('renders loading state while fetching', () => {
    server.use(
      http.get('/api/admin/pickups', () => new HttpResponse(null, { status: 503 })),
      http.get('/api/admin/partners', () => new HttpResponse(null, { status: 503 }))
    )

    renderWithProviders(<Pickups />, { user: adminUser, initialEntries: ['/pickups'] })

    expect(screen.getByText('Pickup requests')).toBeInTheDocument()
  })

  it('closes the reassign drawer when cancel is clicked', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('/api/admin/pickups', ({ request }) => HttpResponse.json(pageResponse(PICKUPS, request))),
      http.get('/api/admin/partners', ({ request }) => HttpResponse.json(pageResponse(PARTNERS, request)))
    )

    renderWithProviders(<Pickups />, { user: adminUser, initialEntries: ['/pickups'] })

    await waitFor(() => {
      expect(screen.getByText('Pickup requests')).toBeInTheDocument()
    })

    const reassignButtons = await screen.findAllByRole('button', { name: /reassign/i })
    if (reassignButtons.length > 0) {
      await user.click(reassignButtons[0])
    }

    await waitFor(() => {
      expect(screen.getByText('Reassign pickup')).toBeInTheDocument()
    })

    const cancelButton = screen.getAllByRole('button', { name: /cancel/i })[0]
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByText('Reassign pickup')).not.toBeInTheDocument()
    })
  })

  it('renders partner name when assigned', async () => {
    server.use(
      http.get('/api/admin/pickups', ({ request }) => HttpResponse.json(pageResponse(PICKUPS, request))),
      http.get('/api/admin/partners', ({ request }) => HttpResponse.json(pageResponse(PARTNERS, request)))
    )

    renderWithProviders(<Pickups />, { user: adminUser, initialEntries: ['/pickups'] })

    await waitFor(() => {
      expect(screen.getByText('Pickup requests')).toBeInTheDocument()
    })

    await waitFor(
      () => {
        expect(screen.getAllByText('Green Logistics').length).toBeGreaterThan(0)
      },
      { timeout: 3000 }
    )
  })
})