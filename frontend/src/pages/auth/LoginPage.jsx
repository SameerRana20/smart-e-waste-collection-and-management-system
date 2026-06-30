import { useMemo, useState } from 'react'
import { Leaf, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { useAuth } from '../../state/auth.jsx'
import { roleHomePath } from '../../routes/roleHomePath.js'
import { ApiError } from '../../services/apiClient.js'

export function LoginPage() {
  const nav = useNavigate()
  const { login, role } = useAuth()

  const [form, setForm] = useState({
    role: role || 'user',
    email: '',
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const canSubmit = useMemo(
    () => {
      if (form.role === 'admin') {
        return form.username.trim() && form.password.trim()
      }
      return form.email.trim() && form.password.trim() && form.role
    },
    [form],
  )

  function clearFieldError() {
    if (loginError) setLoginError('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setLoginError('')
    try {
      const res = await login(form)
      toast.success(res?.message || 'Logged in')
      nav(roleHomePath(form.role), { replace: true })
    } catch (err) {
      const status = err instanceof ApiError ? err.status : err?.response?.status
      const msg =
        (err instanceof ApiError && err.message) ||
        err?.response?.data?.message ||
        err?.message ||
        ''
      const lower = String(msg).toLowerCase()
      const looksAuth =
        status === 401 ||
        status === 404 ||
        lower.includes('invalid') ||
        lower.includes('credential') ||
        lower.includes('not found') ||
        lower.includes('password')
      setLoginError(looksAuth ? 'Invalid credentials' : msg || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-50">
      <div className="container-page flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-center gap-2 text-brand-700">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft">
              <Leaf className="h-6 w-6" />
            </div>
          </div>
          <Card className="p-6">
            <div className="mb-1 text-center text-xl font-semibold text-slate-900">
              Sign in
            </div>
            <div className="mb-6 text-center text-sm text-slate-600">
              EcoCollect
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <Select
                label="Role"
                value={form.role}
                onChange={(e) => {
                  clearFieldError()
                  setForm((s) => ({ ...s, role: e.target.value }))
                }}
              >
                <option value="user">User</option>
                <option value="collector">Collector</option>
                <option value="admin">Admin</option>
              </Select>

              {form.role === 'admin' ? (
                <Input
                  label="Username"
                  autoComplete="username"
                  value={form.username}
                  onChange={(e) => {
                    clearFieldError()
                    setForm((s) => ({ ...s, username: e.target.value }))
                  }}
                  placeholder="sameer"
                />
              ) : (
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => {
                    clearFieldError()
                    setForm((s) => ({ ...s, email: e.target.value }))
                  }}
                  placeholder="you@example.com"
                />
              )}
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => {
                  clearFieldError()
                  setForm((s) => ({ ...s, password: e.target.value }))
                }}
                placeholder="••••••••"
              />

              {loginError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {loginError}
                </div>
              ) : null}

              <Button type="submit" className="w-full" disabled={!canSubmit || loading}>
                <LogIn className="h-4 w-4" />
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-slate-600">
              New user?{' '}
               <Link to="/register" className="font-medium text-brand-700 hover:underline">
                  Create an account
                </Link>
            </div>
            <div className="mt-2 text-center text-sm text-slate-600">
              Want to become a collector?{' '}
              <Link to="/collector/register" className="font-medium text-brand-700 hover:underline">
                 Register as collector
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
