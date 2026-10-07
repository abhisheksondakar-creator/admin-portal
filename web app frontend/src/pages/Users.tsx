import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, Check, UserCog, Search, UserMinus } from 'lucide-react'
import { AxiosError } from 'axios'
import { api } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useToast } from '@/components/ui/toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface AdminUser {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  role: string
  active?: boolean
  isActive?: boolean
  pointsBalance?: number
  createdAt?: string
}

interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
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

export default function Users() {
  const qc = useQueryClient()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState(0)

  const [toggleAction, setToggleAction] = useState<{ id: string; activate: boolean } | null>(null)
  const [roleId, setRoleId] = useState<string | null>(null)
  const [newRole, setNewRole] = useState<string>('')
  const debouncedSearch = useDebouncedValue(search)

  const size = 25

  const { data, isLoading } = useQuery<PageResponse<AdminUser>>({
    queryKey: ['admin-users', page, size, debouncedSearch, roleFilter, statusFilter],
    queryFn: async () => {
      const params: Record<string, any> = { page, size }
      if (debouncedSearch) params.search = debouncedSearch
      if (roleFilter && roleFilter !== 'all') params.role = roleFilter
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter
      const res = await api.get('/admin/users', { params })
      return res.data
    },
  })

  const pageInfo = {
    pageIndex: data?.number ?? 0,
    pageSize: data?.size ?? size,
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 1,
  }

  const toggleActive = useMutation({
    mutationFn: async ({ id, activate }: { id: string; activate: boolean }) => {
      const endpoint = activate ? 'activate' : 'deactivate'
      await api.post(`/admin/users/${id}/${endpoint}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setToggleAction(null)
    },
    onError: (err, { activate }) => {
      const action = activate ? 'activate' : 'suspend'
      const msg = extractErrorMessage(err, `Failed to ${action} user`)
      toast({
        variant: 'danger',
        title: `Unable to ${action} user`,
        description: msg,
      })
    },
  })

  const changeRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      await api.patch(`/admin/users/${id}/role`, { role })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      setRoleId(null)
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to change user role')
      toast({
        variant: 'danger',
        title: 'Unable to change user role',
        description: msg,
      })
    },
  })

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: 'name',
      header: 'User',
      cell: ({ row }: { row: Row<AdminUser> }) => (
        <div>
          <div className="text-sm font-medium text-ink">{row.original.name}</div>
          <div className="text-xs text-ink-muted">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: { row: Row<AdminUser> }) => {
        const r = row.original.role
        const variant: any =
          r === 'ADMIN' ? 'warning' : r === 'PARTNER' ? 'info' : 'secondary'
        return <Badge variant={variant}>{r}</Badge>
      },
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }: { row: Row<AdminUser> }) => {
        const active = row.original.active ?? row.original.isActive ?? true
        return (
          <Badge variant={active ? 'success' : 'danger'}>
            {active ? 'Active' : 'Suspended'}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'pointsBalance',
      header: 'Points',
      cell: ({ row }: { row: Row<AdminUser> }) => (
        <span className="text-sm text-ink font-tabular-nums">
          {(row.original.pointsBalance || 0).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }: { row: Row<AdminUser> }) => (
        <span className="text-sm text-ink-muted font-tabular-nums">
          {row.original.createdAt ? formatDate(row.original.createdAt) : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: { row: Row<AdminUser> }) => {
        const u = row.original
        const active = u.active ?? u.isActive ?? true
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRoleId(u.id)
                setNewRole(u.role)
              }}
              className="h-8 px-2 gap-1"
            >
              <UserCog size={14} strokeWidth={1.5} />
              Role
            </Button>
              <Button
                variant={active ? 'outline' : 'success'}
                size="sm"
                onClick={() => setToggleAction({ id: u.id, activate: !active })}
                disabled={toggleActive.isPending}
                className="h-8 px-2 gap-1"
              >
                {active ? (
                  <>
                    <Ban size={14} strokeWidth={1.5} />
                    Suspend
                  </>
                ) : (
                  <>
                    <Check size={14} strokeWidth={1.5} />
                    Activate
                  </>
                )}
              </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink tracking-tight">Users</h1>
        <p className="text-sm text-ink-muted mt-0.5">Manage registered users and access</p>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">All users</CardTitle>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="relative flex-1 max-w-md">
              <Search size={14} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
              <Input
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="pl-8"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(0) }}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="HOUSEHOLD">Household</SelectItem>
                <SelectItem value="PARTNER">Partner</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0) }}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

      <Dialog open={!!toggleAction} onOpenChange={(o) => !o && setToggleAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{toggleAction?.activate ? 'Activate user' : 'Suspend user'}</DialogTitle>
            <DialogDescription>
              {toggleAction?.activate 
                ? 'This user will be able to sign in again.'
                : 'This user will not be able to sign in until reactivated.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToggleAction(null)}>Cancel</Button>
            <Button
              variant={toggleAction?.activate ? 'success' : 'danger'}
              onClick={() => {
                if (toggleAction) toggleActive.mutate({ id: toggleAction.id, activate: toggleAction.activate })
              }}
              disabled={toggleActive.isPending}
            >
              {toggleAction?.activate ? (
                <>
                  <Check size={14} strokeWidth={1.5} />
                  Confirm activate
                </>
              ) : (
                <>
                  <UserMinus size={14} strokeWidth={1.5} />
                  Confirm suspend
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!roleId} onOpenChange={(o) => !o && setRoleId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change user role</DialogTitle>
          </DialogHeader>
          <Select value={newRole} onValueChange={setNewRole}>
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HOUSEHOLD">Household</SelectItem>
              <SelectItem value="PARTNER">Partner</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleId(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (roleId) changeRole.mutate({ id: roleId, role: newRole })
              }}
              disabled={changeRole.isPending}
            >
              Save role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
