import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Card } from '../../components/ui/Card.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { adminService } from '../../services/adminService.js'
import { useAuth } from '../../state/auth.jsx'

export function AdminProfile() {
  const { refreshMe } = useAuth()
  const { loading, data, run } = useAsync(adminService.me)
  const save = useAsync(adminService.updateProfile)

  const profile = data?.data ?? data ?? null
  const avatarUrl = profile?.avatarUrl || profile?.avatar_url || ''
  const username = profile?.username || ''

  const [form, setForm] = useState({ full_name: '' })

  useEffect(() => {
    run()
  }, [run])

  useEffect(() => {
    if (!profile) return
    setForm({
      full_name: profile.fullName || profile.full_name || '',
    })
  }, [profile])

  const canSave = useMemo(() => form.full_name.trim().length > 0, [form])

  async function onSave() {
    if (!canSave) return
    const res = await save.run({ full_name: form.full_name.trim() })
    toast.success(res?.message || 'Profile updated')
    await refreshMe()
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">Admin profile</div>
        <div className="text-sm text-slate-600">Update your display name and manage security from the menu.</div>
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
                  {(form.full_name || username || 'A')
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
                <div className="truncate text-sm text-slate-600">{username ? `Username: ${username}` : '—'}</div>
              </div>
            </div>

            <Input
              label="Full name"
              value={form.full_name}
              onChange={(e) => setForm((s) => ({ ...s, full_name: e.target.value }))}
            />
            <Input label="Username" value={username} disabled />

            {profile.phone != null && profile.phone !== '' ? (
              <Input label="Phone" value={profile.phone || ''} disabled />
            ) : null}
            {profile.city != null && profile.city !== '' ? (
              <Input label="City" value={profile.city || ''} disabled />
            ) : null}
            {profile.address != null && profile.address !== '' ? (
              <Input className="sm:col-span-2" label="Address" value={profile.address || ''} disabled />
            ) : null}

            <div className="flex flex-wrap items-end gap-2 sm:col-span-2">
              <Button type="button" onClick={onSave} disabled={!canSave || save.loading}>
                {save.loading ? 'Saving…' : 'Save name'}
              </Button>
              <p className="text-xs text-slate-500">
                Use the top-right menu to change password or update your avatar.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
