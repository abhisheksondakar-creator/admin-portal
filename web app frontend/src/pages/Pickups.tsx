import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, ArrowLeftRight } from 'lucide-react'
import { AxiosError } from 'axios'
import { api } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'

interface PickupRow {
  id: string
  userId?: string
  deviceId?: string
  partnerId?: string
  status: string
  address?: string
  scheduledAt?: string
  completedAt?: string
  createdAt?: string
  updatedAt?: string
}

interface PartnerOpt {
  id: string
  orgName: string
  status: string
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' },
]

function statusBadge(status: string): any {
  const s = (status || '').toLowerCase()
  return (
    <Badge
      variant={
        s === 'completed'
          ? 'success'
          : s === 'pending'
            ? 'warning'
            : s === 'accepted'
              ? 'info'
              : s === 'cancelled' || s === 'rejected'
                ? 'danger'
                : 'secondary'
      }
    >
      {status}
    </Badge>
  )
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as any
    if (typeof data?.message === 'string') return data.message
    if (typeof err.message === 'string' && err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export default function Pickups() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('')

  const { data, isLoading } = useQuery<PageResponse<PickupRow>>({
    queryKey: ['admin-pickups', page, statusFilter, search],
    queryFn: async () => {
      const params: any = { page, size: 25 }
      if (statusFilter !== 'all') params.status = statusFilter
      if (search) params.search = search
      const res = await api.get('/admin/pickups', { params })
      return res.data
    },
  })

  const rows = data?.content || []
  const pageInfo = {
    pageIndex: data?.number ?? 0,
    pageSize: data?.size ?? 25,
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 1,
  }

  const { data: partners = [] } = useQuery<PartnerOpt[]>({
    queryKey: ['admin-partners-dropdown'],
    queryFn: async () => {
      const res = await api.get('/admin/partners', { params: { size: 100, status: 'approved' } })
      const page: PageResponse<PartnerOpt> = res.data
      return page.content || []
    },
  })

  const reassign = useMutation({
    mutationFn: async ({ id, partnerId }: { id: string; partnerId?: string }) => {
      await api.post(`/admin/pickups/${id}/reassign`, partnerId ? { partnerId } : {})
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-pickups'] })
      setOpen(false)
      setSelectedId(null)
      setSelectedPartnerId('')
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to reassign pickup')
      toast({
        variant: 'danger',
        title: 'Unable to reassign pickup',
        description: msg,
      })
    },
  })

  const columns: ColumnDef<PickupRow>[] = [
    {
      accessorKey: 'id',
      header: 'Pickup ID',
      cell: ({ row }: { row: Row<PickupRow> }) => (
        <span className="text-xs font-mono text-ink-muted">
          {(row.original.id || '').slice(0, 12)}...
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: Row<PickupRow> }) => statusBadge(row.original.status),
    },
    {
      accessorKey: 'address',
      header: 'Address',
      cell: ({ row }: { row: Row<PickupRow> }) => (
        <span className="text-sm text-ink">{row.original.address || '-'}</span>
      ),
    },
    {
      accessorKey: 'partnerId',
      header: 'Assigned partner',
      cell: ({ row }: { row: Row<PickupRow> }) => {
        const pid = row.original.partnerId
        if (!pid) return <span className="text-sm text-ink-muted">Unassigned</span>
        const p = (partners || []).find((x) => x.id === pid)
        return (
          <span className="text-sm text-ink">
            {p?.orgName || pid.slice(0, 8)}
          </span>
        )
      },
    },
    {
      accessorKey: 'scheduledAt',
      header: 'Scheduled',
      cell: ({ row }: { row: Row<PickupRow> }) => (
        <span className="text-sm text-ink-muted font-tabular-nums">
          {row.original.scheduledAt ? formatDateTime(row.original.scheduledAt) : '-'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: { row: Row<PickupRow> }) => (
        <span className="text-sm text-ink-muted font-tabular-nums">
          {row.original.createdAt ? formatDateTime(row.original.createdAt) : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: { row: Row<PickupRow> }) => (
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedId(row.original.id)
              setSelectedPartnerId(row.original.partnerId || '')
              setOpen(true)
            }}
            className="h-8 px-2 gap-1"
          >
            <ArrowLeftRight size={14} strokeWidth={1.5} />
            Reassign
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink tracking-tight">Pickups</h1>
        <p className="text-sm text-ink-muted mt-0.5">All pickup requests and assignment</p>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium mb-3">Pickup requests</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <Input
                placeholder="Search by address"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
                className="pl-8"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                setPage(0)
              }}
            >
              <SelectTrigger className="w-40 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            serverSide={true}
            pageInfo={pageInfo}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Reassign pickup</DrawerTitle>
            <DrawerDescription>
              Choose a different partner for this pickup request, or leave unassigned.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 space-y-4 max-w-xl mx-auto w-full">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-ink">Partner</label>
              <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                <SelectTrigger className="w-full h-9">
                  <SelectValue placeholder="Unassigned — leave open to offers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {(partners || []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.orgName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DrawerFooter className="flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                if (!selectedId) return
                reassign.mutate({
                  id: selectedId,
                  partnerId: selectedPartnerId || undefined,
                })
              }}
              disabled={reassign.isPending}
            >
              Confirm reassign
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
