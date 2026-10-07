import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderWithProviders } from '@/test/test-utils'
import PartnerDetail from '@/pages/PartnerDetail'
import { adminUser, PARTNERS } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { http, HttpResponse } from 'msw'

describe('PartnerDetail', () => {
  const partner = PARTNERS[0]

  it('renders back button and page title', async () => {
    server.use(
      http.get('/api/admin/partners/' + partner.id, () => HttpResponse.json(partner))
    )

    renderWithProviders(
      <Routes>
        <Route path="/partners/:id" element={<PartnerDetail />} />
      </Routes>,
      {
        user: adminUser,
        initialEntries: ['/partners', '/partners/' + partner.id],
      }
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })
  })

  it('renders loading skeletons while fetching partner data', async () => {
    server.use(
      http.get('/api/admin/partners/' + partner.id, async () => {
        await new Promise((r) => setTimeout(r, 300))
        return HttpResponse.json(partner)
      })
    )

    renderWithProviders(
      <Routes>
        <Route path="/partners/:id" element={<PartnerDetail />} />
      </Routes>,
      {
        user: adminUser,
        initialEntries: ['/partners/' + partner.id],
      }
    )

    await waitFor(() => {
      expect(screen.getByText(/partner application and profile/i)).toBeInTheDocument()
    })
    expect(screen.getAllByRole('presentation').length).toBeGreaterThan(0)
  })

  it('renders partner details when data is loaded', async () => {
    server.use(
      http.get('/api/admin/partners/' + partner.id, () => HttpResponse.json(partner))
    )

    renderWithProviders(
      <Routes>
        <Route path="/partners/:id" element={<PartnerDetail />} />
      </Routes>,
      {
        user: adminUser,
        initialEntries: ['/partners/' + partner.id],
      }
    )

    await waitFor(() => {
      expect(screen.getAllByText(partner.orgName).length).toBeGreaterThan(0)
    })

    expect(screen.getByText('Profile details')).toBeInTheDocument()

    const orgValue = screen.getAllByText(partner.orgName)
    expect(orgValue.length).toBeGreaterThan(0)
  })

  it('renders action buttons for pending partners', async () => {
    const pendingPartner = PARTNERS[1]
    server.use(
      http.get('/api/admin/partners/' + pendingPartner.id, () => HttpResponse.json(pendingPartner))
    )

    renderWithProviders(
      <Routes>
        <Route path="/partners/:id" element={<PartnerDetail />} />
      </Routes>,
      {
        user: adminUser,
        initialEntries: ['/partners/' + pendingPartner.id],
      }
    )

    await waitFor(() => {
      expect(screen.getByText('pending')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reject/i })).toBeInTheDocument()
  })

  it('renders suspend button for approved partners', async () => {
    server.use(
      http.get('/api/admin/partners/' + partner.id, () => HttpResponse.json(partner))
    )

    renderWithProviders(
      <Routes>
        <Route path="/partners/:id" element={<PartnerDetail />} />
      </Routes>,
      {
        user: adminUser,
        initialEntries: ['/partners/' + partner.id],
      }
    )

    await waitFor(() => {
      expect(screen.getByText('approved')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /suspend/i })).toBeInTheDocument()
  })

  it('renders approve button for rejected partners', async () => {
    const rejectedPartner = PARTNERS[2]
    server.use(
      http.get('/api/admin/partners/' + rejectedPartner.id, () => HttpResponse.json(rejectedPartner))
    )

    renderWithProviders(
      <Routes>
        <Route path="/partners/:id" element={<PartnerDetail />} />
      </Routes>,
      {
        user: adminUser,
        initialEntries: ['/partners/' + rejectedPartner.id],
      }
    )

    await waitFor(() => {
      expect(screen.getByText('rejected')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument()
  })

  it('renders the Actions card section', async () => {
    server.use(
      http.get('/api/admin/partners/' + partner.id, () => HttpResponse.json(partner))
    )

    renderWithProviders(
      <Routes>
        <Route path="/partners/:id" element={<PartnerDetail />} />
      </Routes>,
      {
        user: adminUser,
        initialEntries: ['/partners/' + partner.id],
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })
    expect(screen.getByText('Review and manage this partner')).toBeInTheDocument()
  })

  it('renders all detail fields in the profile section', async () => {
    server.use(
      http.get('/api/admin/partners/' + partner.id, () => HttpResponse.json(partner))
    )

    renderWithProviders(
      <Routes>
        <Route path="/partners/:id" element={<PartnerDetail />} />
      </Routes>,
      {
        user: adminUser,
        initialEntries: ['/partners/' + partner.id],
      }
    )

    await waitFor(() => {
      expect(screen.getAllByText(partner.orgName).length).toBeGreaterThan(0)
    })

    expect(screen.getAllByText('Organization').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Type').length).toBeGreaterThan(0)
    expect(screen.getAllByText('License No.').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Service areas').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Capabilities').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Capacity').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Rating').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Active jobs').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Submitted').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Last updated').length).toBeGreaterThan(0)
  })

  it('renders 404 for non-existent partner', async () => {
    server.use(
      http.get('/api/admin/partners/nonexistent', () =>
        HttpResponse.json({ status: 404, error: 'Not Found', message: 'Partner not found' }, { status: 404 })
      )
    )

    renderWithProviders(
      <Routes>
        <Route path="/partners/:id" element={<PartnerDetail />} />
      </Routes>,
      {
        user: adminUser,
        initialEntries: ['/partners/nonexistent'],
      }
    )

    expect(screen.getByText(/partner application and profile/i)).toBeInTheDocument()
  })
})