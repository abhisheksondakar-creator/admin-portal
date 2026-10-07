import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/test/test-utils'
import Health from '@/pages/Health'
import { adminUser } from '@/test/msw/handlers'
import { server } from '@/test/msw/server'
import { http, HttpResponse } from 'msw'

describe('Health', () => {
  it('renders the page title and description', async () => {
    server.use(
      http.get('/api/admin/health', () => HttpResponse.json({
        status: 'UP',
        application: { name: 'ecoloop', version: '0.0.1', uptime_ms: 3600000, uptime: '0d 1h 0m 0s', started_at: '2026-09-15T00:00:00.000Z' },
        services: {
          database: { status: 'UP', uptime: '0d 1h 0m 0s', latency_ms: 2, error_rate: 0.0 },
          session: { status: 'UP', provider: 'redis', namespace: 'ecoloop:session', timeout: '7d' },
          classification: { status: 'UP', total_predictions: 850, predictions_last_hour: 42, latency_ms_p50: 1200 },
        },
        metrics: { total_users: 4, total_partners: 3, total_pickups: 4, pending_pickups: 1, total_predictions: 850 },
      }))
    )

    renderWithProviders(<Health />, { user: adminUser, initialEntries: ['/health'] })

    expect(screen.getByText('System health')).toBeInTheDocument()
    expect(screen.getByText('Live status and performance of all backend services')).toBeInTheDocument()
  })

  it('renders the auto-refresh badge', async () => {
    server.use(
      http.get('/api/admin/health', () => HttpResponse.json({
        status: 'UP',
        application: { name: 'ecoloop', version: '0.0.1', uptime_ms: 3600000, uptime: '0d 1h 0m 0s', started_at: '2026-09-15T00:00:00.000Z' },
        services: {
          database: { status: 'UP', uptime: '0d 1h 0m 0s', latency_ms: 2, error_rate: 0.0 },
          session: { status: 'UP', provider: 'redis', namespace: 'ecoloop:session', timeout: '7d' },
          classification: { status: 'UP', total_predictions: 850, predictions_last_hour: 42, latency_ms_p50: 1200 },
        },
        metrics: { total_users: 4, total_partners: 3, total_pickups: 4, pending_pickups: 1, total_predictions: 850 },
      }))
    )

    renderWithProviders(<Health />, { user: adminUser, initialEntries: ['/health'] })

    await waitFor(() => {
      expect(screen.getByText(/auto-refresh 15s/i)).toBeInTheDocument()
    })
  })

  it('renders the application status card with UP status', async () => {
    server.use(
      http.get('/api/admin/health', () => HttpResponse.json({
        status: 'UP',
        application: { name: 'ecoloop', version: '0.0.1', uptime_ms: 3600000, uptime: '0d 1h 0m 0s', started_at: '2026-09-15T00:00:00.000Z' },
        services: {
          database: { status: 'UP', uptime: '0d 1h 0m 0s', latency_ms: 2, error_rate: 0.0 },
          session: { status: 'UP', provider: 'redis', namespace: 'ecoloop:session', timeout: '7d' },
          classification: { status: 'UP', total_predictions: 850, predictions_last_hour: 42, latency_ms_p50: 1200 },
        },
        metrics: { total_users: 4, total_partners: 3, total_pickups: 4, pending_pickups: 1, total_predictions: 850 },
      }))
    )

    renderWithProviders(<Health />, { user: adminUser, initialEntries: ['/health'] })

    await waitFor(() => {
      expect(screen.getByText(/application: UP/i)).toBeInTheDocument()
    })
  })

  it('renders service cards for Database, Session store, and Classification AI', async () => {
    server.use(
      http.get('/api/admin/health', () => HttpResponse.json({
        status: 'UP',
        application: { name: 'ecoloop', version: '0.0.1', uptime_ms: 3600000, uptime: '0d 1h 0m 0s', started_at: '2026-09-15T00:00:00.000Z' },
        services: {
          database: { status: 'UP', uptime: '0d 1h 0m 0s', latency_ms: 2, error_rate: 0.0 },
          session: { status: 'UP', provider: 'redis', namespace: 'ecoloop:session', timeout: '7d' },
          classification: { status: 'UP', total_predictions: 850, predictions_last_hour: 42, latency_ms_p50: 1200 },
        },
        metrics: { total_users: 4, total_partners: 3, total_pickups: 4, pending_pickups: 1, total_predictions: 850 },
      }))
    )

    renderWithProviders(<Health />, { user: adminUser, initialEntries: ['/health'] })

    await waitFor(() => {
      expect(screen.getByText('Database')).toBeInTheDocument()
    })

    expect(screen.getByText('Session store')).toBeInTheDocument()
    expect(screen.getByText('Classification AI')).toBeInTheDocument()
  })

  it('renders database service details', async () => {
    server.use(
      http.get('/api/admin/health', () => HttpResponse.json({
        status: 'UP',
        application: { name: 'ecoloop', version: '0.0.1', uptime_ms: 3600000, uptime: '0d 1h 0m 0s', started_at: '2026-09-15T00:00:00.000Z' },
        services: {
          database: { status: 'UP', uptime: '0d 1h 0m 0s', latency_ms: 2, error_rate: 0.0 },
          session: { status: 'UP', provider: 'redis', namespace: 'ecoloop:session', timeout: '7d' },
          classification: { status: 'UP', total_predictions: 850, predictions_last_hour: 42, latency_ms_p50: 1200 },
        },
        metrics: { total_users: 4, total_partners: 3, total_pickups: 4, pending_pickups: 1, total_predictions: 850 },
      }))
    )

    renderWithProviders(<Health />, { user: adminUser, initialEntries: ['/health'] })

    await waitFor(() => {
      expect(screen.getByText('Database')).toBeInTheDocument()
    })

    expect(screen.getAllByText('PostgreSQL persistence layer').length).toBeGreaterThan(0)
    expect(screen.getAllByText('UP').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Latency').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Error rate').length).toBeGreaterThan(0)
  })

  it('renders session store details with provider and namespace', async () => {
    server.use(
      http.get('/api/admin/health', () => HttpResponse.json({
        status: 'UP',
        application: { name: 'ecoloop', version: '0.0.1', uptime_ms: 3600000, uptime: '0d 1h 0m 0s', started_at: '2026-09-15T00:00:00.000Z' },
        services: {
          database: { status: 'UP', uptime: '0d 1h 0m 0s', latency_ms: 2, error_rate: 0.0 },
          session: { status: 'UP', provider: 'redis', namespace: 'ecoloop:session', timeout: '7d' },
          classification: { status: 'UP', total_predictions: 850, predictions_last_hour: 42, latency_ms_p50: 1200 },
        },
        metrics: { total_users: 4, total_partners: 3, total_pickups: 4, pending_pickups: 1, total_predictions: 850 },
      }))
    )

    renderWithProviders(<Health />, { user: adminUser, initialEntries: ['/health'] })

    await waitFor(() => {
      expect(screen.getByText('Session store')).toBeInTheDocument()
    })

    expect(screen.getAllByText('redis').length).toBeGreaterThan(0)
    expect(screen.getAllByText('ecoloop:session').length).toBeGreaterThan(0)
    expect(screen.getAllByText('7d').length).toBeGreaterThan(0)
  })

  it('renders classification AI details with predictions', async () => {
    server.use(
      http.get('/api/admin/health', () => HttpResponse.json({
        status: 'UP',
        application: { name: 'ecoloop', version: '0.0.1', uptime_ms: 3600000, uptime: '0d 1h 0m 0s', started_at: '2026-09-15T00:00:00.000Z' },
        services: {
          database: { status: 'UP', uptime: '0d 1h 0m 0s', latency_ms: 2, error_rate: 0.0 },
          session: { status: 'UP', provider: 'redis', namespace: 'ecoloop:session', timeout: '7d' },
          classification: { status: 'UP', total_predictions: 850, predictions_last_hour: 42, latency_ms_p50: 1200 },
        },
        metrics: { total_users: 4, total_partners: 3, total_pickups: 4, pending_pickups: 1, total_predictions: 850 },
      }))
    )

    renderWithProviders(<Health />, { user: adminUser, initialEntries: ['/health'] })

    await waitFor(() => {
      expect(screen.getByText('Classification AI')).toBeInTheDocument()
    })

    expect(screen.getAllByText('External vision providers').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Predictions (total)').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Last hour').length).toBeGreaterThan(0)
  })

  it('renders platform metrics card', async () => {
    server.use(
      http.get('/api/admin/health', () => HttpResponse.json({
        status: 'UP',
        application: { name: 'ecoloop', version: '0.0.1', uptime_ms: 3600000, uptime: '0d 1h 0m 0s', started_at: '2026-09-15T00:00:00.000Z' },
        services: {
          database: { status: 'UP', uptime: '0d 1h 0m 0s', latency_ms: 2, error_rate: 0.0 },
          session: { status: 'UP', provider: 'redis', namespace: 'ecoloop:session', timeout: '7d' },
          classification: { status: 'UP', total_predictions: 850, predictions_last_hour: 42, latency_ms_p50: 1200 },
        },
        metrics: { total_users: 4, total_partners: 3, total_pickups: 4, pending_pickups: 1, total_predictions: 850 },
      }))
    )

    renderWithProviders(<Health />, { user: adminUser, initialEntries: ['/health'] })

    await waitFor(() => {
      expect(screen.getByText('Platform metrics')).toBeInTheDocument()
    })

    expect(screen.getAllByText('Total users').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Total partners').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Total pickups').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pending pickups').length).toBeGreaterThan(0)
    expect(screen.getAllByText('AI predictions').length).toBeGreaterThan(0)
  })

  it('renders loading skeletons while fetching', () => {
    server.use(
      http.get('/api/admin/health', () => new HttpResponse(null, { status: 503 }))
    )

    renderWithProviders(<Health />, { user: adminUser, initialEntries: ['/health'] })

    expect(screen.getByText('System health')).toBeInTheDocument()
    expect(screen.getAllByRole('presentation').length).toBeGreaterThan(0)
  })

  it('renders uptime and started-at info', async () => {
    server.use(
      http.get('/api/admin/health', () => HttpResponse.json({
        status: 'UP',
        application: { name: 'ecoloop', version: '0.0.1', uptime_ms: 3600000, uptime: '0d 1h 0m 0s', started_at: '2026-09-15T00:00:00.000Z' },
        services: {
          database: { status: 'UP', uptime: '0d 1h 0m 0s', latency_ms: 2, error_rate: 0.0 },
          session: { status: 'UP', provider: 'redis', namespace: 'ecoloop:session', timeout: '7d' },
          classification: { status: 'UP', total_predictions: 850, predictions_last_hour: 42, latency_ms_p50: 1200 },
        },
        metrics: { total_users: 4, total_partners: 3, total_pickups: 4, pending_pickups: 1, total_predictions: 850 },
      }))
    )

    renderWithProviders(<Health />, { user: adminUser, initialEntries: ['/health'] })

    await waitFor(() => {
      expect(screen.getByText(/uptime:/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/started:/i)).toBeInTheDocument()
  })

  it('renders error state when backend is unreachable', async () => {
    server.use(
      http.get('/api/admin/health', () =>
        HttpResponse.json(
          { status: 500, error: 'Internal Server Error', message: 'Database connection failed' },
          { status: 500 }
        )
      )
    )

    renderWithProviders(<Health />, { user: adminUser, initialEntries: ['/health'] })

    await waitFor(() => {
      expect(screen.getByText('Unreachable')).toBeInTheDocument()
    })
  })
})