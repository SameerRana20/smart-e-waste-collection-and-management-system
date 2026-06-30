import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { KeyRound, LogOut, Menu, Upload } from 'lucide-react'
import { useAuth } from '../../state/auth.jsx'
import { Modal } from '../ui/Modal.jsx'
import { Button } from '../ui/Button.jsx'
import { Input } from '../ui/Input.jsx'
import { userService } from '../../services/userService.js'
import { collectorService } from '../../services/collectorService.js'
import { adminService } from '../../services/adminService.js'

export function Topbar({ onOpenMenu }) {
  const nav = useNavigate()
  const { user, role, logout, refreshMe } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const [pwOpen, setPwOpen] = useState(false)
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const pwValid = pw.newPassword.trim().length > 0

  const [avatarOpen, setAvatarOpen] = useState(false)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarLoading, setAvatarLoading] = useState(false)

  const displayName = useMemo(() => {
    if (!user) return ''
    return user.fullName || user.full_name || user.username || user.email || ''
  }, [user])

  const accountHint = useMemo(() => {
    if (!user) return ''
    const r = String(role || '').toLowerCase()
    if (r === 'admin') return user.username || user.email || ''
    return user.email || ''
  }, [user, role])

  const avatarUrl = user?.avatarUrl || user?.avatar_url || ''

  const initials = useMemo(() => {
    const s = String(displayName || '').trim()
    if (!s) return '?'
    const parts = s.split(/\s+/).slice(0, 2)
    return parts.map((p) => p[0]?.toUpperCase()).join('') || '?'
  }, [displayName])

  const profilePath = useMemo(() => {
    const r = String(role || '').toLowerCase()
    if (r === 'collector') return '/collector/profile'
    if (r === 'admin') return '/admin/profile'
    return '/profile'
  }, [role])

  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(() => {
    if (!avatarFile) {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
      setAvatarPreview('')
      return
    }
    const url = URL.createObjectURL(avatarFile)
    setAvatarPreview(url)
    return () => URL.revokeObjectURL(url)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarFile])

  async function submitPassword() {
    if (!pw.currentPassword.trim() || !pw.newPassword.trim()) {
      toast.error('Please enter current and new password')
      return
    }
    setPwLoading(true)
    try {
      const r = String(role || '').toLowerCase()
      const res =
        r === 'collector'
          ? await collectorService.changePassword(pw)
          : r === 'admin'
            ? await adminService.changePassword(pw)
            : await userService.changePassword(pw)
      toast.success(res?.message || 'Password updated')
      setPwOpen(false)
      setPw({ currentPassword: '', newPassword: '' })
      // backend clears cookies on password change → logout to avoid a broken session
      logout()
      nav('/login', { replace: true })
    } finally {
      setPwLoading(false)
    }
  }

  async function submitAvatar() {
    if (!avatarFile) return
    setAvatarLoading(true)
    try {
      const r = String(role || '').toLowerCase()
      const res =
        r === 'admin' ? await adminService.updateAvatar(avatarFile) : await userService.updateAvatar(avatarFile)
      toast.success(res?.message || 'Avatar updated')
      await refreshMe()
      setAvatarOpen(false)
      setAvatarFile(null)
    } finally {
      setAvatarLoading(false)
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={onOpenMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-slate-900">EcoCollect</span>
        </div>

        <div className="hidden text-base font-medium text-slate-600 md:block">
          Welcome back{displayName ? `, ${displayName}` : ''}.
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((s) => !s)}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-800">
                {initials}
              </span>
            )}
            <span className="max-w-[160px] truncate">{displayName || 'Account'}</span>
          </button>

          {open ? (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
              <div className="px-4 py-3">
                <div className="text-sm font-semibold text-slate-900">{displayName || '—'}</div>
                <div className="text-xs text-slate-500">{accountHint}</div>
              </div>
              <div className="border-t border-slate-100" />

              <Link
                to={profilePath}
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Profile
              </Link>

              {String(role || '').toLowerCase() === 'user' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setAvatarOpen(true)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Upload className="h-4 w-4" />
                    Update Avatar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setPwOpen(true)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <KeyRound className="h-4 w-4" />
                    Change Password
                  </button>
                </>
              ) : null}

              {String(role || '').toLowerCase() === 'admin' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setAvatarOpen(true)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Upload className="h-4 w-4" />
                    Update Avatar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setPwOpen(true)
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <KeyRound className="h-4 w-4" />
                    Change Password
                  </button>
                </>
              ) : null}

              {String(role || '').toLowerCase() === 'collector' ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    setPwOpen(true)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </button>
              ) : null}

              <div className="border-t border-slate-100" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  logout()
                  nav('/login', { replace: true })
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-rose-700 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <Modal
        open={avatarOpen}
        title="Update avatar"
        onClose={() => {
          if (avatarLoading) return
          setAvatarOpen(false)
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAvatarOpen(false)} disabled={avatarLoading}>
              Cancel
            </Button>
            <Button onClick={submitAvatar} disabled={!avatarFile || avatarLoading}>
              {avatarLoading ? 'Uploading…' : 'Upload'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Choose image"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          />
          {avatarPreview ? (
            <div className="flex items-center gap-3">
              <img
                src={avatarPreview}
                alt="Preview"
                className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200"
              />
              <div className="text-sm text-slate-600">Preview</div>
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        open={pwOpen}
        title="Change password"
        onClose={() => {
          if (pwLoading) return
          setPwOpen(false)
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPwOpen(false)} disabled={pwLoading}>
              Cancel
            </Button>
            <Button
              onClick={submitPassword}
              disabled={pwLoading || !pwValid}
            >
              {pwLoading ? 'Saving…' : 'Save'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Current password"
            type="password"
            value={pw.currentPassword}
            onChange={(e) => setPw((s) => ({ ...s, currentPassword: e.target.value }))}
          />
          <Input
            label="New password"
            type="password"
            value={pw.newPassword}
            onChange={(e) => {
              const v = e.target.value
              setPw((s) => ({ ...s, newPassword: v }))
              if (import.meta?.env?.DEV) console.log('[ChangePassword] newPassword:', v)
            }}
          />
          <div className="text-xs text-slate-500">
            After updating, you’ll be asked to sign in again.
          </div>
        </div>
      </Modal>
    </header>
  )
}

