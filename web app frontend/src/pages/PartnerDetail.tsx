import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, X, Ban, Loader2 } from 'lucide-react'
import { AxiosError } from 'axios'
import { api } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/toast'

interface PartnerDetail {
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

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as any
    if (typeof data?.message === 'string') return data.message
    if (typeof err.message === 'string' && err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export default function PartnerDetail() {
  const { id = '' } = useParams()
  const qc = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery<PartnerDetail>({
    queryKey: ['partner-detail', id],
    queryFn: async () => {
      const res = await api.get(`/admin/partners/${id}`)
      return res.data
    },
    enabled: !!id,
  })

  const s = (data?.status || '').toLowerCase()
  const orgName = data?.orgName || 'this partner'

  const actionMutation = useMutation({
    mutationFn: async ({ action, actionLabel }: { action: 'approve' | 'reject' | 'suspend'; actionLabel: string }) => {
      await api.post(`/admin/partners/${id}/${action}`)
      return { action, actionLabel }
    },
    onSuccess: async ({ actionLabel }) => {
      await qc.invalidateQueries({ queryKey: ['partner-detail', id] })
      await qc.invalidateQueries({ queryKey: ['admin-partners'] })
      toast({
        variant: 'success',
        title: `Partner ${actionLabel}d`,
        description: `${orgName} has been ${actionLabel}d successfully.`,
      })
    },
    onError: (err, { action, actionLabel }) => {
      const msg = extractErrorMessage(err, `Failed to ${action} partner`)
      toast({
        variant: 'danger',
        title: `Unable to ${actionLabel} partner`,
        description: msg,
      })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild className="h-8 px-2">
          <Link to="/partners">
            <ArrowLeft size={14} strokeWidth={1.5} />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-ink tracking-tight">
            {isLoading ? <Skeleton className="h-6 w-48" /> : data?.orgName}
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">Partner application and profile</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2">
          <CardHeader className="py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Profile details</CardTitle>
              {data && (
                <Badge
                  variant={
                    s === 'approved' ? 'success' : s === 'pending' ? 'warning' : s === 'rejected' ? 'danger' : 'secondary'
                  }
                >
                  {data.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 py-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-64 col-span-3" />
                  </div>
                ))}
              </div>
            ) : (
              <dl className="text-sm">
                {[
                  ['Organization', data?.orgName],
                  ['Type', data?.type],
                  ['License No.', data?.licenseNo],
                  ['Service areas', data?.serviceAreas],
                  ['Capabilities', data?.capabilities],
                  ['Capacity', data?.capacity?.toLocaleString()],
                  ['Rating', data?.rating != null ? Number(data.rating).toFixed(2) : '-'],
                  ['Active jobs', data?.activeJobCount ?? 0],
                  ['Submitted', data?.createdAt ? formatDate(data.createdAt) : '-'],
                  ['Last updated', data?.updatedAt ? formatDate(data.updatedAt) : '-'],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-4 gap-4 py-2 border-b border-border last:border-0">
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className="col-span-3 text-ink">{v || '-'}</dd>
                  </div>
                ))}
              </dl>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
            <CardDescription>Review and manage this partner</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : (
              <>
                {s === 'pending' && (
                  <>
                    <Button
                      variant="success"
                      className="w-full gap-2"
                      onClick={() => actionMutation.mutate({ action: 'approve', actionLabel: 'Approve' })}
                      disabled={actionMutation.isPending}
                    >
                      {actionMutation.isPending ? (
                        <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                      ) : (
                        <Check size={14} strokeWidth={1.5} />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      className="w-full gap-2"
                      onClick={() => actionMutation.mutate({ action: 'reject', actionLabel: 'Reject' })}
                      disabled={actionMutation.isPending}
                    >
                      {actionMutation.isPending ? (
                        <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                      ) : (
                        <X size={14} strokeWidth={1.5} />
                      )}
                      Reject
                    </Button>
                  </>
                )}
                {s === 'approved' && (
                  <Button
                    variant="warning"
                    className="w-full gap-2"
                    onClick={() => actionMutation.mutate({ action: 'suspend', actionLabel: 'Suspend' })}
                    disabled={actionMutation.isPending}
                  >
                    {actionMutation.isPending ? (
                      <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                    ) : (
                      <Ban size={14} strokeWidth={1.5} />
                    )}
                    Suspend
                  </Button>
                )}
                {(s === 'rejected' || s === 'suspended') && (
                  <Button
                    variant="success"
                    className="w-full gap-2"
                    onClick={() => actionMutation.mutate({ action: 'approve', actionLabel: 'Approve' })}
                    disabled={actionMutation.isPending}
                  >
                    {actionMutation.isPending ? (
                      <Loader2 size={14} strokeWidth={1.5} className="animate-spin" />
                    ) : (
                      <Check size={14} strokeWidth={1.5} />
                    )}
                    Approve
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
