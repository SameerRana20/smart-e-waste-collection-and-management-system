import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Card } from '../../components/ui/Card.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { userService } from '../../services/userService.js'
import { useAuth } from '../../state/auth.jsx'

export function UserProfile() {
  const { refreshMe } = useAuth()
  const { loading, data, run } = useAsync(userService.getProfile)
  const save = useAsync(userService.updateProfile)

  const profile = data?.data ?? null
  const avatarUrl = profile?.avatarUrl || profile?.avatar_url || ''
  const email = profile?.email || ''

  const [form, setForm] = useState({ full_name: '', phone: '', address: '', city: '' })

  useEffect(() => {
    run()
  }, [run])

  useEffect(() => {
    if (!profile) return
    if (import.meta?.env?.DEV) console.log('[UserProfile] profile:', profile)
    setForm({
      full_name: profile.fullName || '',
      phone: profile.phone || '',
      address: profile.address || '',
      city: profile.city || '',
    })
  }, [profile])

  const canSave = useMemo(() => form.full_name.trim(), [form])

  async function onSave() {
    if (!canSave) return
    const res = await save.run({
      full_name: form.full_name,
      phone: form.phone,
      address: form.address,
      city: form.city,
    })
    toast.success(res?.message || 'Profile updated')
    await refreshMe()
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">Profile</div>
        <div className="text-sm text-slate-600">Manage your account information.</div>
      </div>

      <Card className="p-5">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner />
            Loading…
          </div>
        ) : !profile ? (
          <div className="text-sm text-slate-700">Unable to load profile.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-lg font-semibold text-brand-800">
                  {(form.full_name || 'U')
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p[0]?.toUpperCase())
                    .join('')}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {profile.fullName || form.full_name || '—'}
                </div>
                <div className="truncate text-sm text-slate-600">{email || '—'}</div>
              </div>
            </div>

            <Input
              label="Full name"
              value={form.full_name}
              onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))}
            />
            <Input label="Email" value={email} disabled />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
            />
            <Input
              label="Address"
              value={form.address}
              onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
            />
            <Input
              label="City"
              value={form.city}
              onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
            />
            <div className="flex items-end">
              <Button
                type="button"
                onClick={onSave}
                disabled={!canSave || save.loading}
                className="w-full sm:w-auto"
              >
                {save.loading ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

