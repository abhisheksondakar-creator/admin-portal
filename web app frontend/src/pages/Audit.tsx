import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Download, Eye, Loader2 } from 'lucide-react'
import { AxiosError } from 'axios'
import { api } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef, Row } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { useToast } from '@/components/ui/toast'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'

interface AuditRow {
  id: string
  actorId?: string
  actorRole?: string
  action: string
  entityType?: string
  entityId?: string
  result?: string
  details?: Record<string, any>
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

export default function Audit() {
  const { toast } = useToast()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<AuditRow | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const debouncedSearch = useDebouncedValue(search)

  const { data, isLoading } = useQuery<PageResponse<AuditRow>>({
    queryKey: ['admin-audit', page, debouncedSearch],
    queryFn: async () => {
      const params: any = { page, size: 25 }
      if (debouncedSearch) params.search = debouncedSearch
      const res = await api.get('/admin/audit', { params })
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

  const exportCsv = async () => {
    try {
      setIsExporting(true)
      const res = await api.get('/admin/audit/export', {
        responseType: 'blob',
        params: search ? { search } : undefined,
        headers: { Accept: 'text/csv, application/json' },
      })
      const blob: Blob = res.data
      if (blob.type.includes('application/json')) {
        const text = await blob.text()
        try {
          const json = JSON.parse(text)
          throw { response: { data: json, status: res.status }, message: json?.message || 'Export failed' } as AxiosError
        } catch {
          throw new Error(text || 'Export failed')
        }
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast({
        variant: 'success',
        title: 'Export complete',
        description: 'Audit log CSV has been downloaded.',
      })
    } catch (e) {
      const msg = extractErrorMessage(e, 'An unknown error occurred during export')
      toast({
        variant: 'danger',
        title: 'Export failed',
        description: msg,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const columns: ColumnDef<AuditRow>[] = [
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }: { row: Row<AuditRow> }) => (
        <span className="text-sm font-medium text-ink">{row.original.action}</span>
      ),
    },
    {
      accessorKey: 'entityType',
      header: 'Entity',
      cell: ({ row }: { row: Row<AuditRow> }) => {
        const e = row.original
        return (
          <div>
            <div className="text-sm text-ink">{e.entityType || '-'}</div>
            <div className="text-xs text-ink-muted font-mono">
              {e.entityId ? e.entityId.slice(0, 12) + '...' : '-'}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'actorRole',
      header: 'Actor',
      cell: ({ row }: { row: Row<AuditRow> }) => {
        const r = row.original.actorRole
        return r ? <Badge variant="outline">{r}</Badge> : <span className="text-sm text-ink-muted">system</span>
      },
    },
    {
      accessorKey: 'result',
      header: 'Result',
      cell: ({ row }: { row: Row<AuditRow> }) => {
        const r = row.original.result
        const variant: any =
          r === 'success'
            ? 'success'
            : r === 'failed' || r === 'error'
              ? 'danger'
              : 'secondary'
        return r ? (
          <Badge variant={variant} className="text-[11px] px-1.5 py-0.5 h-5">
            {r}
          </Badge>
        ) : (
          <span className="text-sm text-ink-muted">-</span>
        )
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Timestamp',
      cell: ({ row }: { row: Row<AuditRow> }) => (
        <span className="text-sm text-ink-muted font-tabular-nums">
          {row.original.createdAt ? formatDateTime(row.original.createdAt) : '-'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: { row: Row<AuditRow> }) => (
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelected(row.original)
              setOpen(true)
            }}
            className="h-8 px-2 gap-1"
          >
            <Eye size={14} strokeWidth={1.5} />
            Details
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">Audit log</h1>
          <p className="text-sm text-ink-muted mt-0.5">Immutable record of all administrative actions</p>
        </div>
        <Button variant="outline" onClick={exportCsv} className="gap-1.5" disabled={isExporting}>
          {isExporting ? (
            <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
          ) : (
            <Download size={14} strokeWidth={1.5} />
          )}
          {isExporting ? 'Exporting…' : 'Export CSV'}
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium mb-3">Entries</CardTitle>
          <div className="relative max-w-md">
            <Search size={14} strokeWidth={1.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <Input
              placeholder="Search action, entity, or actor"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              className="pl-8"
            />
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
            <DrawerTitle>Audit entry details</DrawerTitle>
            <DrawerDescription>
              Full JSON payload and metadata for this immutable log entry.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <div className="max-w-xl mx-auto w-full space-y-4">
              <dl className="text-sm grid grid-cols-4 gap-4">
                <dt className="text-ink-muted">ID</dt>
                <dd className="col-span-3 font-mono text-xs break-all">{selected?.id}</dd>
                <dt className="text-ink-muted">Action</dt>
                <dd className="col-span-3">{selected?.action}</dd>
                <dt className="text-ink-muted">Entity</dt>
                <dd className="col-span-3">
                  {selected?.entityType || '-'}
                  {selected?.entityId ? ` / ${selected.entityId}` : ''}
                </dd>
                <dt className="text-ink-muted">Actor</dt>
                <dd className="col-span-3">{selected?.actorRole || 'system'}</dd>
                <dt className="text-ink-muted">Result</dt>
                <dd className="col-span-3">{selected?.result || '-'}</dd>
                <dt className="text-ink-muted">Created</dt>
                <dd className="col-span-3 font-tabular-nums">
                  {selected?.createdAt ? formatDateTime(selected.createdAt) : '-'}
                </dd>
              </dl>
              <div>
                <div className="text-sm text-ink-muted mb-1.5">Details (JSON)</div>
                <pre className="text-xs bg-surface-2 border border-border rounded-card p-3 overflow-auto max-h-64 font-mono text-ink whitespace-pre-wrap">
{JSON.stringify(selected?.details ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 px-4 pb-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
