import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Leaf, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { useAuth } from '../../state/auth.jsx'

export function CollectorRegisterPage() {
  const nav = useNavigate()
  const { registerCollector } = useAuth()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    vehicle_number: '',
    organization_name: '',
  })
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => {
    return (
      form.full_name.trim() &&
      form.email.trim() &&
      form.password.trim() &&
      form.phone.trim() &&
      form.city.trim() &&
      form.vehicle_number.trim() &&
      form.organization_name.trim()
    )
  }, [form])

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    try {
      const res = await registerCollector({
        fullName: form.full_name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        city: form.city,
        vehicleNumber: form.vehicle_number,
        organizationName: form.organization_name,
      })
      toast.success(res?.message || 'Collector registered')
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
              Collector registration
            </div>
            <div className="mb-6 text-center text-sm text-slate-600">
              Register as a collector (admin approval required).
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
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />
              <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              />
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
              />
              <Input
                label="City"
                value={form.city}
                onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
              />
              <Input
                label="Vehicle number"
                value={form.vehicle_number}
                onChange={(e) => setForm((s) => ({ ...s, vehicle_number: e.target.value }))}
              />
              <Input
                label="Organization name"
                value={form.organization_name}
                onChange={(e) => setForm((s) => ({ ...s, organization_name: e.target.value }))}
              />

              <Button type="submit" className="w-full" disabled={!canSubmit || loading}>
                <UserPlus className="h-4 w-4" />
                {loading ? 'Submitting…' : 'Register'}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-slate-600">
              Already registered?{' '}
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

