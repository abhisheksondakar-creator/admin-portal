import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import Overview from '@/pages/Overview'
import { adminUser, USERS, PARTNERS, PICKUPS, AUDIT_LOGS } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { http, HttpResponse } from 'msw'

function buildOverviewResponse({
  users = USERS,
  partners = PARTNERS,
  pickups = PICKUPS,
  audit = AUDIT_LOGS,
}: {
  users?: any[]
  partners?: any[]
  pickups?: any[]
  audit?: any[]
}) {
  const now = new Date()
  const last7d: { date: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const mmdd = key.slice(5)
    const count = pickups.filter((p: any) => {
      const pd = new Date(p.createdAt || p.updatedAt || 0)
      return pd.toISOString().slice(0, 10) === key
    }).length
    last7d.push({ date: mmdd, count })
  }
  const recent = audit.slice(0, 10).map((a: any, i: number) => ({
    id: a.id || String(i),
    action: a.action || 'unknown',
    entity: a.entityType ? `${a.entityType}:${(a.entityId || '').slice(0, 8)}` : '-',
    actor: a.actorRole || 'system',
    timestamp: a.createdAt,
    result: a.result || '-',
  }))
  return {
    totalUsers: users.length,
    totalPartners: partners.length,
    totalPickups: pickups.length,
    pendingPickups: pickups.filter((p: any) => p.status === 'pending').length,
    totalPredictions: Math.round(pickups.length * 0.85),
    pickupsLast7d: last7d,
    recentActivity: recent,
  }
}

describe('Overview', () => {
  it('shows loading skeletons while data is being fetched', () => {
    server.use(
      http.get('/api/admin/overview', () => new HttpResponse(null, { status: 503 }))
    )

    renderWithProviders(<Overview />, { user: adminUser, initialEntries: ['/overview'] })

    expect(screen.getAllByRole('presentation').length).toBeGreaterThan(0)
  })

  it('renders all metric cards with correct values', async () => {
    const testUsers = [
      { id: '1', email: 'a@b.co', name: 'Admin', active: true, pointsBalance: 0, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '2', email: 'b@b.co', name: 'User2', active: true, pointsBalance: 0, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '3', email: 'c@b.co', name: 'User3', active: true, pointsBalance: 0, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '4', email: 'd@b.co', name: 'User4', active: true, pointsBalance: 0, createdAt: '2026-01-01T00:00:00.000Z' },
    ]
    const testPartners = [
      { id: '1', orgName: 'P1', status: 'approved', type: 'commercial', capacity: 0, rating: 0, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '2', orgName: 'P2', status: 'approved', type: 'commercial', capacity: 0, rating: 0, createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '3', orgName: 'P3', status: 'approved', type: 'commercial', capacity: 0, rating: 0, createdAt: '2026-01-01T00:00:00.000Z' },
    ]
    const testPickups = [
      { id: '1', status: 'completed', address: '1 St', createdAt: '2026-01-20T00:00:00.000Z', updatedAt: '2026-01-20T00:00:00.000Z' },
      { id: '2', status: 'completed', address: '2 St', createdAt: '2026-01-20T00:00:00.000Z', updatedAt: '2026-01-20T00:00:00.000Z' },
      { id: '3', status: 'completed', address: '3 St', createdAt: '2026-01-20T00:00:00.000Z', updatedAt: '2026-01-20T00:00:00.000Z' },
      { id: '4', status: 'pending', address: '4 St', createdAt: '2026-01-20T00:00:00.000Z', updatedAt: '2026-01-20T00:00:00.000Z' },
    ]
    const testAudit = [
      { id: '1', action: 'test', entityType: 'T', entityId: '1', actorRole: 'ADMIN', result: 'success', createdAt: '2026-01-01T00:00:00.000Z' },
    ]

    server.use(
      http.get('/api/admin/overview', () =>
        HttpResponse.json(buildOverviewResponse({ users: testUsers, partners: testPartners, pickups: testPickups, audit: testAudit }))
      )
    )

    renderWithProviders(<Overview />, { user: adminUser, initialEntries: ['/overview'] })

    await waitFor(() => {
      expect(screen.getByText('Total users')).toBeInTheDocument()
      expect(screen.getByText('Total partners')).toBeInTheDocument()
      expect(screen.getByText('Total pickups')).toBeInTheDocument()
      expect(screen.getByText('Pending pickups')).toBeInTheDocument()
      expect(screen.getByText('AI classifications')).toBeInTheDocument()
    })

    const userValues = screen.getAllByText('4')
    expect(userValues.length).toBeGreaterThan(0)
    const partnerValues = screen.getAllByText('3')
    expect(partnerValues.length).toBeGreaterThan(0)
    const pendingValues = screen.getAllByText('1')
    expect(pendingValues.length).toBeGreaterThan(0)
  })

  it('renders the daily pickups chart', async () => {
    renderWithProviders(<Overview />, { user: adminUser, initialEntries: ['/overview'] })

    await waitFor(() => {
      expect(screen.getByText('Daily pickups')).toBeInTheDocument()
    })

    expect(screen.getByText(/last 7 days/i)).toBeInTheDocument()
  })

  it('renders the recent activity table', async () => {
    renderWithProviders(<Overview />, { user: adminUser, initialEntries: ['/overview'] })

    await waitFor(() => {
      expect(screen.getByText('Recent activity')).toBeInTheDocument()
    })
  })

  it('renders metric card labels', async () => {
    renderWithProviders(<Overview />, { user: adminUser, initialEntries: ['/overview'] })

    await waitFor(() => {
      expect(screen.getByText('Total users')).toBeInTheDocument()
      expect(screen.getByText('Total partners')).toBeInTheDocument()
      expect(screen.getByText('Total pickups')).toBeInTheDocument()
      expect(screen.getByText('Pending pickups')).toBeInTheDocument()
      expect(screen.getByText('AI classifications')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    server.use(
      http.get('/api/admin/overview', () => new HttpResponse(null, { status: 500 }))
    )

    renderWithProviders(<Overview />, { user: adminUser, initialEntries: ['/overview'] })

    await waitFor(() => {
      expect(screen.getByText('Total users')).toBeInTheDocument()
    })
  })

  it('renders empty state gracefully when no data', async () => {
    server.use(
      http.get('/api/admin/overview', () =>
        HttpResponse.json(buildOverviewResponse({ users: [], partners: [], pickups: [], audit: [] }))
      )
    )

    renderWithProviders(<Overview />, { user: adminUser, initialEntries: ['/overview'] })

    await waitFor(() => {
      expect(screen.getByText('Total users')).toBeInTheDocument()
      expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    })

    await waitFor(
      () => {
        expect(screen.getByText('No results.')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('formats pickup counts using last 7 days', async () => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const testPickups = [
      { id: 'p1', status: 'completed', address: '123 St', createdAt: yesterday.toISOString(), updatedAt: yesterday.toISOString() },
      { id: 'p2', status: 'pending', address: '456 St', createdAt: now.toISOString(), updatedAt: now.toISOString() },
    ]
    server.use(
      http.get('/api/admin/overview', () =>
        HttpResponse.json(buildOverviewResponse({ pickups: testPickups, users: [], partners: [], audit: [] }))
      )
    )

    renderWithProviders(<Overview />, { user: adminUser, initialEntries: ['/overview'] })

    await waitFor(() => {
      expect(screen.getByText('Total pickups')).toBeInTheDocument()
      const metricValue = screen.getAllByText('2')
      expect(metricValue.length).toBeGreaterThan(0)
    })
  })
})
