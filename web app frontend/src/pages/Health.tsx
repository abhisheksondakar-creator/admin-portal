import { useQuery } from '@tanstack/react-query'
import { Database, KeyRound, Sparkles, CheckCircle2, XCircle, Clock, Activity, AlertTriangle } from 'lucide-react'
import { api } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ServiceStatus {
  status: string
  uptime?: string
  latency_ms?: number
  error_rate?: number
  provider?: string
  namespace?: string
  timeout?: string
  total_predictions?: number
  predictions_last_hour?: number
  latency_ms_p50?: number
  error?: string
}

interface HealthData {
  status: string
  application: {
    name: string
    version: string
    uptime_ms: number
    uptime: string
    started_at: string
  }
  services: {
    database: ServiceStatus
    session: ServiceStatus
    classification: ServiceStatus
  }
  metrics?: {
    total_users: number
    total_partners: number
    total_pickups: number
    pending_pickups: number
    total_predictions: number
  }
}

function StatusPill({ status }: { status: string }) {
  const ok = status === 'UP'
  return (
    <div className="flex items-center gap-1.5">
      {ok ? (
        <CheckCircle2 size={14} className="text-success" />
      ) : (
        <XCircle size={14} className="text-danger" />
      )}
      <span
        className={cn(
          'text-sm font-medium',
          ok ? 'text-success' : 'text-danger'
        )}
      >
        {status}
      </span>
    </div>
  )
}

function ServiceCard({
  title,
  description,
  icon: Icon,
  status,
  rows,
}: {
  title: string
  description: string
  icon: any
  status?: ServiceStatus
  rows: { label: string; value: React.ReactNode }[]
}) {
  return (
    <Card>
      <CardHeader className="py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-btn border border-border bg-surface-2 flex items-center justify-center">
              <Icon size={15} strokeWidth={1.5} className="text-ink" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <CardDescription className="text-xs">{description}</CardDescription>
            </div>
          </div>
          {status ? <StatusPill status={status.status || 'UNKNOWN'} /> : null}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <dl className="text-sm divide-y divide-border">
          {rows.map((r) => (
            <div key={r.label} className="grid grid-cols-3 gap-3 py-2 last:border-0">
              <dt className="text-ink-muted col-span-1">{r.label}</dt>
              <dd className="col-span-2 text-ink font-tabular-nums">{r.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

export default function Health() {
  const { data, isLoading, error } = useQuery<HealthData>({
    queryKey: ['admin-health'],
    queryFn: async () => {
      const res = await api.get('/admin/health')
      return res.data
    },
    refetchInterval: 15000,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">System health</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Live status and performance of all backend services
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 h-6">
          <Activity size={12} strokeWidth={1.5} />
          Auto-refresh 15s
        </Badge>
      </div>

      <Card className={cn(
        'border-l-4',
        data?.status === 'UP' ? 'border-l-success' : 'border-l-danger'
      )}>
        <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {(data?.status || error) ? (
                <>
                  {error ? (
                    <XCircle size={16} className="text-danger" />
                  ) : data?.status === 'UP' ? (
                    <CheckCircle2 size={16} className="text-success" />
                  ) : (
                    <AlertTriangle size={16} className="text-warning" />
                  )}
                  <span>
                    {error ? 'Unreachable' : `Application: ${data?.status || 'UNKNOWN'}`}
                  </span>
                </>
              ) : null}
            </CardTitle>
            <CardDescription className="mt-0.5">
              {data?.application?.name ? (
                <>
                  {data.application.name} · {data.application.version || 'dev'}
                </>
              ) : (
                'ECOLOOP backend'
              )}
            </CardDescription>
          </div>
          <div className="text-right text-xs text-ink-muted space-y-1 font-tabular-nums">
            <div className="flex items-center justify-end gap-1.5">
              <Clock size={12} strokeWidth={1.5} />
              Uptime: {data?.application?.uptime ?? '—'}
            </div>
            <div>
              Started:{' '}
              {data?.application?.started_at
                ? new Date(data.application.started_at).toLocaleString()
                : '—'}
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardHeader className="py-4">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-3 w-56 mt-1" />
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {[0, 1, 2, 3].map((j) => (
                  <div key={j} className="grid grid-cols-3 gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-36 col-span-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <ServiceCard
            title="Database"
            description="PostgreSQL persistence layer"
            icon={Database}
            status={data?.services.database}
            rows={[
              { label: 'Status', value: data?.services.database?.status || 'N/A' },
              { label: 'Uptime', value: data?.services.database?.uptime || '—' },
              {
                label: 'Latency',
                value:
                  typeof data?.services.database?.latency_ms === 'number'
                    ? `${data.services.database.latency_ms} ms`
                    : '—',
              },
              {
                label: 'Error rate',
                value:
                  typeof data?.services.database?.error_rate === 'number'
                    ? `${(data.services.database.error_rate * 100).toFixed(2)}%`
                    : '0.00%',
              },
            ]}
          />

          <ServiceCard
            title="Session store"
            description="Redis-backed HTTP sessions"
            icon={KeyRound}
            status={data?.services.session}
            rows={[
              { label: 'Provider', value: data?.services.session?.provider || 'redis' },
              { label: 'Namespace', value: <span className="font-mono text-xs">{data?.services.session?.namespace || 'ecoloop:session'}</span> },
              { label: 'Timeout', value: data?.services.session?.timeout || '7d' },
              {
                label: 'Status',
                value: data?.services.session?.status ? (
                  <StatusPill status={data.services.session.status} />
                ) : (
                  '—'
                ),
              },
            ]}
          />

          <ServiceCard
            title="Classification AI"
            description="External vision providers"
            icon={Sparkles}
            status={data?.services.classification}
            rows={[
              {
                label: 'Predictions (total)',
                value: (data?.services.classification?.total_predictions ?? 0).toLocaleString(),
              },
              {
                label: 'Last hour',
                value: (data?.services.classification?.predictions_last_hour ?? 0).toLocaleString(),
              },
              {
                label: 'p50 latency',
                value:
                  typeof data?.services.classification?.latency_ms_p50 === 'number'
                    ? `${data.services.classification.latency_ms_p50} ms`
                    : '—',
              },
              {
                label: 'Status',
                value: data?.services.classification?.status ? (
                  <StatusPill status={data.services.classification.status} />
                ) : (
                  '—'
                ),
              },
            ]}
          />
        </div>
      )}

      {data?.metrics ? (
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Platform metrics</CardTitle>
            <CardDescription>Aggregate counts from health endpoint</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-5 gap-4 divide-x divide-border">
              {[
                ['Total users', data.metrics.total_users],
                ['Total partners', data.metrics.total_partners],
                ['Total pickups', data.metrics.total_pickups],
                ['Pending pickups', data.metrics.pending_pickups],
                ['AI predictions', data.metrics.total_predictions],
              ].map(([label, v]) => (
                <div key={label as string} className="px-4 first:pl-0 last:pr-0">
                  <div className="text-xs text-ink-muted mb-1">{label as string}</div>
                  <div className="text-2xl font-semibold text-ink font-tabular-nums">
                    {(v as number).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
