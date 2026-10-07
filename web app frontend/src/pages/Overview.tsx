import { useQuery } from '@tanstack/react-query'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, Handshake, Truck, Recycle, ArrowUpRight } from 'lucide-react'
import { api } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, cn } from '@/lib/utils'

interface OverviewData {
  totalUsers: number
  totalPartners: number
  totalPickups: number
  pendingPickups: number
  totalPredictions: number
  pickupsLast7d: { date: string; count: number }[]
  recentActivity: ActivityItem[]
}

interface ActivityItem {
  id: string
  action: string
  entity: string
  actor: string
  timestamp: string
  result: string
}

const EMPTY_OVERVIEW: OverviewData = {
  totalUsers: 0,
  totalPartners: 0,
  totalPickups: 0,
  pendingPickups: 0,
  totalPredictions: 0,
  pickupsLast7d: [],
  recentActivity: [],
}

export default function Overview() {
  const { data, isLoading } = useQuery<OverviewData>({
    queryKey: ['overview'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/overview')
        return res.data
      } catch {
        return { ...EMPTY_OVERVIEW }
      }
    },
  })

  const metrics = data
    ? [
        { label: 'Total users', value: data.totalUsers, icon: Users, accent: 'info' },
        { label: 'Total partners', value: data.totalPartners, icon: Handshake, accent: 'success' },
        { label: 'Total pickups', value: data.totalPickups, icon: Truck, accent: 'accent' },
        { label: 'Pending pickups', value: data.pendingPickups, icon: ArrowUpRight, accent: 'warning' },
        { label: 'AI classifications', value: data.totalPredictions, icon: Recycle, accent: 'info' },
      ]
    : []

  const columns: ColumnDef<ActivityItem>[] = [
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }: { row: Row<ActivityItem> }) => (
        <span className="text-sm text-ink font-medium">{row.original.action}</span>
      ),
    },
    {
      accessorKey: 'entity',
      header: 'Entity',
      cell: ({ row }: { row: Row<ActivityItem> }) => (
        <span className="text-sm text-ink-muted font-mono">{row.original.entity}</span>
      ),
    },
    {
      accessorKey: 'actor',
      header: 'Actor',
      cell: ({ row }: { row: Row<ActivityItem> }) => (
        <Badge variant="outline" className="text-[11px] px-1.5 py-0.5 h-5">
          {row.original.actor}
        </Badge>
      ),
    },
    {
      accessorKey: 'result',
      header: 'Result',
      cell: ({ row }: { row: Row<ActivityItem> }) => {
        const r = row.original.result
        const variant: any =
          r === 'success'
            ? 'success'
            : r === 'failed' || r === 'error'
              ? 'danger'
              : 'secondary'
        return (
          <Badge variant={variant} className="text-[11px] px-1.5 py-0.5 h-5">
            {r}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }: { row: Row<ActivityItem> }) => (
        <span className="text-sm text-ink-muted font-tabular-nums">
          {formatDateTime(row.original.timestamp)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink tracking-tight">Overview</h1>
        <p className="text-sm text-ink-muted mt-0.5">Platform metrics and recent activity</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-7 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          : metrics.map(({ label, value, icon: Icon, accent }) => (
              <Card key={label}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-ink-muted font-medium">{label}</span>
                    <Icon
                      size={14}
                      strokeWidth={1.5}
                      className={cn({
                        'text-info': accent === 'info',
                        'text-success': accent === 'success',
                        'text-accent': accent === 'accent',
                        'text-warning': accent === 'warning',
                      })}
                    />
                  </div>
                  <div className="text-2xl font-semibold text-ink font-tabular-nums">
                    {value.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
          <CardTitle className="text-sm font-medium">Daily pickups</CardTitle>
          <span className="text-xs text-ink-muted">Last 7 days</span>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64 w-full">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Skeleton className="h-[90%] w-[95%]" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.pickupsLast7d || []} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
                  <XAxis dataKey="date" stroke="#6B6560" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B6560" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      border: '1px solid #E7E5E4',
                      borderRadius: 8,
                      fontSize: 12,
                      padding: '6px 10px',
                      background: '#FFFFFF',
                    }}
                    labelStyle={{ color: '#14110F', fontWeight: 500 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#C2410C"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#C2410C', strokeWidth: 0 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <DataTable
            columns={columns}
            data={data?.recentActivity || []}
            loading={isLoading}
            showPagination={false}
            pageSize={10}
          />
        </CardContent>
      </Card>
    </div>
  )
}
