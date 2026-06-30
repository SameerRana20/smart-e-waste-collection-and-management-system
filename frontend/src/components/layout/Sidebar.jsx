import { NavLink } from 'react-router-dom'
import { Leaf } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../state/auth.jsx'
import { getNavItems } from './navConfig.js'

export function Sidebar({ mobileOpen, onClose }) {
  const { role, logout } = useAuth()
  const items = getNavItems(role)

  function Nav() {
    return (
      <nav className="px-3 py-2">
        {items.map((it) => {
          const Icon = it.icon
          return (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'mb-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </NavLink>
          )
        })}

        <button
          type="button"
          onClick={() => {
            logout()
            onClose?.()
          }}
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Logout
        </button>
      </nav>
    )
  }

  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white/80 backdrop-blur md:block">
        <div className="flex h-16 items-center gap-2 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-slate-900">EcoCollect</div>
            <div className="text-xs text-slate-500 capitalize">{role || 'user'} portal</div>
          </div>
        </div>

        <Nav />
      </aside>

      {/* Mobile drawer */}
      <div className={clsx('md:hidden', mobileOpen ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div
          className={clsx(
            'fixed inset-0 z-40 bg-slate-900/30 transition-opacity',
            mobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={onClose}
        />
        <aside
          className={clsx(
            'fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white shadow-soft transition-transform',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex h-16 items-center gap-2 px-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-900">EcoCollect</div>
              <div className="text-xs text-slate-500 capitalize">{role || 'user'} portal</div>
            </div>
          </div>
          <Nav />
        </aside>
      </div>
    </>
  )
}

