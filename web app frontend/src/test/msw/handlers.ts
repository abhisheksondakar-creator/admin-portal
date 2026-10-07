import { http, HttpResponse } from 'msw'
import { User } from '@/store/auth'

export const USERS: User[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    email: 'admin@ecoloop.app',
    name: 'Admin User',
    phone: '+1-555-0100',
    address: '123 Admin St',
    role: 'ADMIN',
    active: true,
    createdAt: '2026-01-15T10:30:00.000Z',
    updatedAt: '2026-01-15T10:30:00.000Z',
    pointsBalance: 150,
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    email: 'user1@ecoloop.app',
    name: 'Alice Household',
    phone: '+1-555-0101',
    address: '456 Oak Ave',
    role: 'HOUSEHOLD',
    active: true,
    createdAt: '2026-01-20T14:00:00.000Z',
    updatedAt: '2026-01-20T14:00:00.000Z',
    pointsBalance: 420,
  },
  {
    id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    email: 'user2@ecoloop.app',
    name: 'Bob Smith',
    phone: '+1-555-0102',
    address: '789 Pine Rd',
    role: 'HOUSEHOLD',
    active: false,
    createdAt: '2026-01-22T09:15:00.000Z',
    updatedAt: '2026-01-25T11:00:00.000Z',
    pointsBalance: 50,
  },
  {
    id: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    email: 'partner1@ecoloop.app',
    name: 'Green Logistics',
    phone: '+1-555-0200',
    address: '101 Green Way',
    role: 'PARTNER',
    active: true,
    createdAt: '2026-01-18T08:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
    pointsBalance: 0,
  },
]

export const PARTNERS = [
  {
    id: 'p1a2b3c4-d5e6-f789-abcd-ef1234567890',
    userId: 'd4e5f6a7-b8c9-0123-defa-234567890123',
    orgName: 'Green Logistics',
    type: 'commercial',
    status: 'approved',
    licenseNo: 'LIC-001',
    serviceAreas: 'Downtown, Westside',
    capabilities: 'EV truck, 2-ton capacity',
    capacity: 10,
    rating: 4.5,
    activeJobCount: 3,
    createdAt: '2026-01-18T08:00:00.000Z',
    updatedAt: '2026-01-18T08:00:00.000Z',
  },
  {
    id: 'p2b3c4d5-e6f7-a890-bcde-f12345678901',
    userId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    orgName: 'Eco Pickup Co',
    type: 'cooperative',
    status: 'pending',
    licenseNo: 'LIC-002',
    serviceAreas: 'Northside',
    capabilities: 'Bike courier',
    capacity: 5,
    rating: 0.0,
    activeJobCount: 0,
    createdAt: '2026-01-25T12:00:00.000Z',
    updatedAt: '2026-01-25T12:00:00.000Z',
  },
  {
    id: 'p3c4d5e6-f7a8-b901-cdef-12345678901',
    userId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    orgName: 'Rejected Movers',
    type: 'commercial',
    status: 'rejected',
    licenseNo: 'LIC-003',
    serviceAreas: 'Eastside',
    capabilities: 'Van',
    capacity: 8,
    rating: 2.5,
    activeJobCount: 0,
    createdAt: '2026-01-24T10:00:00.000Z',
    updatedAt: '2026-01-24T10:00:00.000Z',
  },
]

export const PICKUPS = [
  {
    id: 'pk1a2b3c4-d5e6-f789-abcd-ef1234567890',
    userId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    deviceId: 'dev-001',
    partnerId: 'p1a2b3c4-d5e6-f789-abcd-ef1234567890',
    status: 'completed',
    address: '456 Oak Ave, Springfield',
    scheduledAt: '2026-01-21T10:00:00.000Z',
    completedAt: '2026-01-21T14:30:00.000Z',
    createdAt: '2026-01-20T14:00:00.000Z',
    updatedAt: '2026-01-21T14:30:00.000Z',
  },
  {
    id: 'pk2b3c4d5-e6f7-a890-bcde-f12345678901',
    userId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    deviceId: 'dev-002',
    partnerId: null,
    status: 'pending',
    address: '789 Pine Rd, Springfield',
    scheduledAt: null,
    completedAt: null,
    createdAt: '2026-01-25T09:00:00.000Z',
    updatedAt: '2026-01-25T09:00:00.000Z',
  },
  {
    id: 'pk3c4d5e6-f7a8-b901-cdef-12345678901',
    userId: 'user3-uuid-placeholder-12345678901',
    deviceId: 'dev-003',
    partnerId: 'p1a2b3c4-d5e6-f789-abcd-ef1234567890',
    status: 'accepted',
    address: '321 Elm St, Springfield',
    scheduledAt: '2026-01-26T09:00:00.000Z',
    completedAt: null,
    createdAt: '2026-01-25T16:00:00.000Z',
    updatedAt: '2026-01-25T16:30:00.000Z',
  },
  {
    id: 'pk4d5e6f7-a8b9-c012-defa-23456789012',
    userId: 'user4-uuid-placeholder-12345678901',
    deviceId: 'dev-004',
    partnerId: null,
    status: 'cancelled',
    address: '654 Maple Dr, Springfield',
    scheduledAt: null,
    completedAt: null,
    createdAt: '2026-01-24T11:00:00.000Z',
    updatedAt: '2026-01-24T11:30:00.000Z',
  },
]

export const AUDIT_LOGS = [
  {
    id: 'aud1-a2b3-c4d5-e6f7-890123456789',
    actorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    actorRole: 'ADMIN',
    action: 'user.activate',
    entityType: 'User',
    entityId: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    result: 'success',
    details: { ip: '127.0.0.1', userAgent: 'Mozilla/5.0' },
    createdAt: '2026-01-25T11:00:00.000Z',
  },
  {
    id: 'aud2-b3c4-d5e6-f7a8-901234567890',
    actorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    actorRole: 'ADMIN',
    action: 'partner.approve',
    entityType: 'Partner',
    entityId: 'p1a2b3c4-d5e6-f789-abcd-ef1234567890',
    result: 'success',
    details: { previousStatus: 'pending', newStatus: 'approved' },
    createdAt: '2026-01-20T08:30:00.000Z',
  },
  {
    id: 'aud3-c4d5-e6f7-a8b9-012345678901',
    actorId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    actorRole: 'ADMIN',
    action: 'pickup.reassign',
    entityType: 'PickupRequest',
    entityId: 'pk2b3c4d5-e6f7-a890-bcde-f12345678901',
    result: 'success',
    details: { previousPartner: null, newPartner: 'Green Logistics' },
    createdAt: '2026-01-25T10:15:00.000Z',
  },
  {
    id: 'aud4-d5e6-f7a8-b9c0-123456789012',
    actorId: 'system',
    actorRole: 'SYSTEM',
    action: 'system.health_check',
    entityType: 'Health',
    entityId: null,
    result: 'success',
    details: {},
    createdAt: '2026-01-26T00:00:00.000Z',
  },
]

export const HEALTH_DATA = {
  status: 'UP',
  application: {
    name: 'ecoloop',
    version: '0.0.1-SNAPSHOT',
    uptime_ms: 3600000,
    uptime: '0d 1h 0m 0s',
    started_at: '2026-09-15T00:00:00.000Z',
  },
  services: {
    database: {
      status: 'UP',
      uptime: '0d 1h 0m 0s',
      latency_ms: 2,
      error_rate: 0.0,
    },
    session: {
      status: 'UP',
      provider: 'redis',
      namespace: 'ecoloop:session',
      timeout: '7d',
    },
    classification: {
      status: 'UP',
      total_predictions: 850,
      predictions_last_hour: 42,
      latency_ms_p50: 1200,
    },
  },
  metrics: {
    total_users: 4,
    total_partners: 3,
    total_pickups: 4,
    pending_pickups: 1,
    total_predictions: 850,
  },
}

export const adminUser = USERS[0]
export const householdUser = USERS[1]
export const suspendedUser = USERS[2]
export const partnerUser = USERS[3]

export function pageResponse<T extends object>(
  items: T[],
  request: Request
) {
  const params = new URL(request.url).searchParams
  const page = Math.max(0, Number(params.get('page') || 0))
  const size = Math.max(1, Number(params.get('size') || 25))
  const search = params.get('search')?.trim().toLowerCase()
  const role = params.get('role')?.toLowerCase()
  const status = params.get('status')?.toLowerCase()
  const filtered = items.filter((item) => {
    if (search && !Object.values(item).some((value) =>
      typeof value === 'string' && value.toLowerCase().includes(search)
    )) return false
    const values = Object.fromEntries(Object.entries(item))
    if (role && String(values.role || '').toLowerCase() !== role) return false
    if (status) {
      const itemStatus = String(values.status || '').toLowerCase()
      const matchesStatus = itemStatus
        ? itemStatus === status
        : status === 'active'
        ? values.active === true
        : status === 'suspended'
          ? values.active === false
          : true
      if (!matchesStatus) return false
    }
    return true
  })

  return {
    content: filtered.slice(page * size, (page + 1) * size),
    totalElements: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / size)),
    number: page,
    size,
  }
}

export const handlers = [
  http.get('/api/auth/csrf', () => {
    return HttpResponse.json({
      token: 'mock-csrf-token',
      headerName: 'X-XSRF-TOKEN',
      parameterName: '_csrf',
    })
  }),

  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string }
    const user = USERS.find((u) => u.email === body.email)
    if (!user) {
      return HttpResponse.json(
        { status: 401, error: 'Unauthorized', message: 'Invalid email or password' },
        { status: 401 }
      )
    }
    return HttpResponse.json(user)
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as { email: string; password: string; name: string }
    if (USERS.some((u) => u.email === body.email)) {
      return HttpResponse.json(
        { status: 409, error: 'Conflict', message: 'Email already registered' },
        { status: 409 }
      )
    }
    if (!body.email || !body.email.includes('@')) {
      return HttpResponse.json(
        { status: 400, error: 'Bad Request', message: 'Validation failed' },
        { status: 400 }
      )
    }
    return HttpResponse.json(
      {
        id: 'new-uuid-1234',
        email: body.email,
        name: body.name,
        phone: null,
        address: null,
        role: 'HOUSEHOLD',
        active: true,
        createdAt: new Date().toISOString(),
        pointsBalance: 0,
      },
      { status: 201 }
    )
  }),

  http.get('/api/auth/me', () => {
    return HttpResponse.json(adminUser)
  }),

  http.post('/api/auth/logout', () => HttpResponse.json(null, { status: 204 })),

  http.get('/api/admin/users', ({ request }) => HttpResponse.json(pageResponse(USERS, request))),

  http.post('/api/admin/users/:id/activate', () => {
    return HttpResponse.json(USERS[2])
  }),

  http.post('/api/admin/users/:id/deactivate', () => {
    return HttpResponse.json(USERS[1])
  }),

  http.patch('/api/admin/users/:id/role', async ({ params, request }) => {
    const { role } = await request.json() as { role: string }
    if (!['HOUSEHOLD', 'PARTNER', 'ADMIN'].includes(role)) {
      return HttpResponse.json(
        { status: 400, error: 'Bad Request', message: 'Invalid role' },
        { status: 400 }
      )
    }
    return HttpResponse.json({ ...USERS[1], role })
  }),

  http.get('/api/admin/partners', ({ request }) => HttpResponse.json(pageResponse(PARTNERS, request))),

  http.get('/api/admin/partners/:id', ({ params }) => {
    const partner = PARTNERS.find((p) => p.id === params.id)
    if (!partner) {
      return HttpResponse.json(
        { status: 404, error: 'Not Found', message: 'Partner not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json(partner)
  }),

  http.post('/api/admin/partners/:id/approve', ({ params }) => {
    const partner = PARTNERS.find((p) => p.id === params.id)
    if (!partner) {
      return HttpResponse.json(
        { status: 404, error: 'Not Found', message: 'Partner not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json({ ...partner, status: 'approved' })
  }),

  http.post('/api/admin/partners/:id/reject', ({ params }) => {
    const partner = PARTNERS.find((p) => p.id === params.id)
    if (!partner) {
      return HttpResponse.json(
        { status: 404, error: 'Not Found', message: 'Partner not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json({ ...partner, status: 'rejected' })
  }),

  http.post('/api/admin/partners/:id/suspend', ({ params }) => {
    const partner = PARTNERS.find((p) => p.id === params.id)
    if (!partner) {
      return HttpResponse.json(
        { status: 404, error: 'Not Found', message: 'Partner not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json({ ...partner, status: 'suspended' })
  }),

  http.get('/api/admin/pickups', ({ request }) => HttpResponse.json(pageResponse(PICKUPS, request))),

  http.post('/api/admin/pickups/:id/reassign', async ({ params, request }) => {
    const body = await request.json().catch(() => null) as { partnerId?: string } | null
    const pickup = PICKUPS.find((p) => p.id === params.id)
    if (!pickup) {
      return HttpResponse.json(
        { status: 404, error: 'Not Found', message: 'Pickup not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json({
      ...pickup,
      partnerId: body?.partnerId || null,
    })
  }),

  http.get('/api/admin/overview', () => {
    const now = new Date()
    const last7d: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const mmdd = key.slice(5)
      const count = PICKUPS.filter((p: any) => {
        const pd = new Date(p.createdAt || p.updatedAt || 0)
        return pd.toISOString().slice(0, 10) === key
      }).length
      last7d.push({ date: mmdd, count })
    }
    const recent = AUDIT_LOGS.slice(0, 10).map((a: any, i: number) => ({
      id: a.id || String(i),
      action: a.action || 'unknown',
      entity: a.entityType ? `${a.entityType}:${(a.entityId || '').slice(0, 8)}` : '-',
      actor: a.actorRole || 'system',
      timestamp: a.createdAt,
      result: a.result || '-',
    }))
    const pickupList = PICKUPS
    return HttpResponse.json({
      totalUsers: USERS.length,
      totalPartners: PARTNERS.length,
      totalPickups: pickupList.length,
      pendingPickups: pickupList.filter((p: any) => p.status === 'pending').length,
      totalPredictions: Math.round(pickupList.length * 0.85),
      pickupsLast7d: last7d,
      recentActivity: recent,
    })
  }),

  http.get('/api/admin/audit', ({ request }) => HttpResponse.json(pageResponse(AUDIT_LOGS, request))),

  http.get('/api/admin/audit/export', () => {
    const csv = 'id,actor_id,actor_role,action,entity_type,entity_id,result,created_at\n' +
      AUDIT_LOGS.map((l) => [
        l.id, l.actorId || '', l.actorRole || '', l.action,
        l.entityType || '', l.entityId || '',
        l.result || '', l.createdAt,
      ].join(',')).join('\n')
    return new HttpResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=audit-log.csv',
      },
    })
  }),

  http.get('/api/admin/health', () => HttpResponse.json(HEALTH_DATA)),

  http.get('/api/partners/:id', ({ params }) => {
    const partner = PARTNERS.find((p) => p.id === params.id)
    if (!partner) {
      return HttpResponse.json(
        { status: 404, error: 'Not Found', message: 'Partner not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json(partner)
  }),

  http.get('/api/partners/me', () => HttpResponse.json(PARTNERS[0])),

  http.get('/api/partners/offers', () => HttpResponse.json([])),

  http.get('/api/partners/jobs', () => HttpResponse.json(PICKUPS.filter((p) => p.partnerId === PARTNERS[0].id))),

  http.get('/api/partners/kpis', () => HttpResponse.json({
    offersToday: 5,
    activeJobs: 3,
    monthlyCompletions: 12,
    pointsBalance: 300,
    nextOfferAt: null,
    capacityUsed: 3,
    capacityTotal: 10,
  })),

  http.post('/api/pickups', async ({ request }) => {
    const body = await request.json() as { address: string; deviceId?: string }
    if (!body.address) {
      return HttpResponse.json(
        { status: 400, error: 'Bad Request', message: 'Address is required' },
        { status: 400 }
      )
    }
    return HttpResponse.json(
      {
        id: 'new-pickup-uuid',
        userId: 'current-user',
        deviceId: body.deviceId || null,
        partnerId: null,
        status: 'pending',
        address: body.address,
        scheduledAt: null,
        completedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    )
  }),

  http.get('/api/pickups', () => HttpResponse.json(PICKUPS.filter((p) => p.userId === 'b2c3d4e5-f6a7-8901-bcde-f12345678901'))),

  http.get('/api/pickups/:id', ({ params }) => {
    const pickup = PICKUPS.find((p) => p.id === params.id)
    if (!pickup) {
      return HttpResponse.json(
        { status: 404, error: 'Not Found', message: 'Pickup not found' },
        { status: 404 }
      )
    }
    return HttpResponse.json(pickup)
  }),

  http.post('/api/pickups/:id/accept', ({ params }) => {
    const pickup = PICKUPS.find((p) => p.id === params.id)
    return pickup
      ? HttpResponse.json({ ...pickup, status: 'accepted' })
      : HttpResponse.json({ status: 404, error: 'Not Found', message: 'Pickup not found' }, { status: 404 })
  }),

  http.post('/api/pickups/:id/complete', ({ params }) => {
    const pickup = PICKUPS.find((p) => p.id === params.id)
    return pickup
      ? HttpResponse.json({ ...pickup, status: 'completed', completedAt: new Date().toISOString() })
      : HttpResponse.json({ status: 404, error: 'Not Found', message: 'Pickup not found' }, { status: 404 })
  }),

  http.post('/api/pickups/:id/reject', ({ params }) => {
    const pickup = PICKUPS.find((p) => p.id === params.id)
    return pickup
      ? HttpResponse.json({ ...pickup, status: 'rejected' })
      : HttpResponse.json({ status: 404, error: 'Not Found', message: 'Pickup not found' }, { status: 404 })
  }),

  http.post('/api/pickups/:id/cancel', ({ params }) => {
    const pickup = PICKUPS.find((p) => p.id === params.id)
    return pickup
      ? HttpResponse.json({ ...pickup, status: 'cancelled' })
      : HttpResponse.json({ status: 404, error: 'Not Found', message: 'Pickup not found' }, { status: 404 })
  }),

  http.get('/api/actuator/health', () => HttpResponse.json({ status: 'UP' })),
]
