import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, X, Ban, Eye, Search } from 'lucide-react'
import { AxiosError } from 'axios'
import { api } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface PartnerRow {
  id: string
  userId?: string
  orgName: string
  type?: string
  status: string
  licenseNo?: string
  serviceAreas?: string
  capabilities?: string
  capacity?: number
  rating?: number
  activeJobCount?: number
  createdAt?: string
  updatedAt?: string
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const TABS = [
  { value: 'pending', label: 'Pending', badgeVariant: 'warning' as const },
  { value: 'approved', label: 'Approved', badgeVariant: 'success' as const },
  { value: 'rejected', label: 'Rejected', badgeVariant: 'danger' as const },
  { value: 'suspended', label: 'Suspended', badgeVariant: 'secondary' as const },
]

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as any
    if (typeof data?.message === 'string') return data.message
    if (typeof err.message === 'string' && err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export default function Partners() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { toast } = useToast()
  const [tab, setTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const [action, setAction] = useState<{ id: string; kind: 'approve' | 'reject' | 'suspend' } | null>(null)

  const size = 25

  const { data, isLoading } = useQuery<PageResponse<PartnerRow>>({
    queryKey: ['admin-partners', page, size, tab, search],
    queryFn: async () => {
      const params: Record<string, any> = { page, size }
      if (search) params.search = search
      if (tab && tab !== 'all') params.status = tab
      const res = await api.get('/admin/partners', { params })
      return res.data
    },
  })

  const pageInfo = {
    pageIndex: data?.number ?? 0,
    pageSize: data?.size ?? size,
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 1,
  }

  const act = useMutation({
    mutationFn: async ({ id, kind }: { id: string; kind: 'approve' | 'reject' | 'suspend' }) => {
      await api.post(`/admin/partners/${id}/${kind}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-partners'] })
      setAction(null)
    },
    onError: (err, { kind }) => {
      const msg = extractErrorMessage(err, `Failed to ${kind} partner`)
      toast({
        variant: 'danger',
        title: `Unable to ${kind} partner`,
        description: msg,
      })
    },
  })

  const columns: ColumnDef<PartnerRow>[] = [
    {
      accessorKey: 'orgName',
      header: 'Organization',
      cell: ({ row }: { row: Row<PartnerRow> }) => (
        <div>
          <div className="text-sm font-medium text-ink">{row.original.orgName}</div>
          <div className="text-xs text-ink-muted">{row.original.type || '-'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: Row<PartnerRow> }) => {
        const s = (row.original.status || '').toLowerCase()
        const t = TABS.find((x) => x.value === s)
        return <Badge variant={t?.badgeVariant || 'secondary'}>{row.original.status}</Badge>
      },
    },
    {
      accessorKey: 'capacity',
      header: 'Capacity',
      cell: ({ row }: { row: Row<PartnerRow> }) => (
        <span className="text-sm text-ink font-tabular-nums">{row.original.capacity ?? '-'}</span>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }: { row: Row<PartnerRow> }) => {
        const r = row.original.rating
        return (
          <span className="text-sm text-ink font-tabular-nums">
            {r != null ? Number(r).toFixed(2) : '-'}
          </span>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Submitted',
      cell: ({ row }: { row: Row<PartnerRow> }) => (
        <span className="text-sm text-ink-muted font-tabular-nums">
          {row.original.createdAt ? formatDate(row.original.createdAt) : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: { row: Row<PartnerRow> }) => {
        const p = row.original
        const status = (p.status || '').toLowerCase()
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/partners/${p.id}`)}
              className="h-8 px-2 gap-1"
            >
              <Eye size={14} strokeWidth={1.5} />
              View
            </Button>
            {status === 'pending' && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => setAction({ id: p.id, kind: 'approve' })}
                  className="h-8 px-2 gap-1"
                >
                  <Check size={14} strokeWidth={1.5} />
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setAction({ id: p.id, kind: 'reject' })}
                  className="h-8 px-2 gap-1"
                >
                  <X size={14} strokeWidth={1.5} />
                  Reject
                </Button>
              </>
            )}
            {status === 'approved' && (
              <Button
                variant="warning"
                size="sm"
                onClick={() => setAction({ id: p.id, kind: 'suspend' })}
                className="h-8 px-2 gap-1"
              >
                <Ban size={14} strokeWidth={1.5} />
                Suspend
              </Button>
            )}
            {(status === 'rejected' || status === 'suspended') && (
              <Button
                variant="success"
                size="sm"
                onClick={() => setAction({ id: p.id, kind: 'approve' })}
                className="h-8 px-2 gap-1"
              >
                <Check size={14} strokeWidth={1.5} />
                Approve
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  const actionTitle =
    action?.kind === 'approve'
      ? 'Approve partner'
      : action?.kind === 'reject'
        ? 'Reject partner'
        : 'Suspend partner'

  const actionDesc =
    action?.kind === 'approve'
      ? 'This partner will be visible to users and eligible for pickup offers.'
      : action?.kind === 'reject'
        ? 'This partner application will be rejected.'
        : 'This partner will be suspended and will not receive new offers.'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink tracking-tight">Partners</h1>
        <p className="text-sm text-ink-muted mt-0.5">Review and manage partner applications</p>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between mb-3">
            <CardTitle className="text-sm font-medium">Partner applications</CardTitle>
          </div>
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(0) }}>
            <div className="flex items-center justify-between gap-3">
              <TabsList>
                {TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="relative max-w-xs flex-1">
                <Search size={14} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                <Input
                  placeholder="Search organization"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                  className="pl-8"
                />
              </div>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-0">
          <DataTable
            columns={columns}
            data={data?.content || []}
            loading={isLoading}
            serverSide
            pageInfo={pageInfo}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <Dialog open={!!action} onOpenChange={(o) => !o && setAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionTitle}</DialogTitle>
            <DialogDescription>{actionDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAction(null)}>Cancel</Button>
            <Button
              variant={action?.kind === 'approve' ? 'success' : action?.kind === 'reject' ? 'danger' : 'warning'}
              onClick={() => action && act.mutate(action)}
              disabled={act.isPending}
            >
              Confirm {action?.kind}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
