import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Recycle } from 'lucide-react'
import { api } from '@/api/client'
import { useAuthStore } from '@/store/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useMutation } from '@tanstack/react-query'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/overview', { replace: true })
    }
  }, [user, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await api.post('/auth/login', data)
      return res.data
    },
    onSuccess: async (user) => {
      if (user.role === 'ADMIN') {
        setUser(user)
        navigate('/overview')
      } else {
        setUser(null)
        try {
          await api.post('/auth/logout')
        } catch {
          // ignore
        }
        setServerError('Admin access required. Please use the admin portal.')
      }
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Sign in failed'
      setServerError(msg)
    },
  })

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-card border border-border bg-surface flex items-center justify-center">
            <Recycle size={20} strokeWidth={1.5} className="text-accent" />
          </div>
          <h1 className="text-lg font-semibold text-ink tracking-tight">ECOLOOP Admin</h1>
        </div>

        <Card>
          <CardContent className="pt-5">
            <form
              onSubmit={handleSubmit((d) => {
                setServerError(null)
                loginMutation.mutate(d)
              })}
              noValidate
              className="space-y-4"
            >
              {serverError && (
                <div className="rounded-chip border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                  {serverError}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@ecoloop.app"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-danger">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-danger">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Signing in' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
