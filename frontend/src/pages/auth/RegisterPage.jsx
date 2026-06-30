import { useMemo, useState } from 'react'
import { Leaf, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { useAuth } from '../../state/auth.jsx'
import { roleHomePath } from '../../routes/roleHomePath.js'

export function RegisterPage() {
  const nav = useNavigate()
  const { registerUser } = useAuth()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
  })
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(
    () => form.full_name.trim() && form.email.trim() && form.password.trim(),
    [form],
  )

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    try {
      const res = await registerUser({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        phone: form.phone ? Number(form.phone) : undefined,
        address: form.address || undefined,
        city: form.city || undefined,
      })
      toast.success(res?.message || 'Account created')
      nav('/login', { replace: true })
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
              Create account
            </div>
            <div className="mb-6 text-center text-sm text-slate-600">
              Start requesting safe e‑waste pickups.
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="Full name"
                value={form.full_name}
                onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))}
              />
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />
              <Input
                label="Phone (optional)"
                value={form.phone}
                onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
              />
              <Input
                label="Address (optional)"
                value={form.address}
                onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
              />
              <Input
                label="City (optional)"
                value={form.city}
                onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
              />
              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              />

              <Button type="submit" className="w-full" disabled={!canSubmit || loading}>
                <UserPlus className="h-4 w-4" />
                {loading ? 'Creating…' : 'Create account'}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <a className="font-medium text-brand-700 hover:underline" href="/login">
                Sign in
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

