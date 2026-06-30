import { useEffect, useMemo } from 'react'
import { ClipboardList, Users } from 'lucide-react'
import { Card } from '../../components/ui/Card.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { adminService } from '../../services/adminService.js'

/** Backend getAdminStats returns: users, collectors, requests{ total_requests, pending, ... }, disposition{ recycled, ... }, total_items */
function coerceNum(v) {
  if (v == null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function normalizeDashboard(raw) {
  const d = raw?.data ?? raw
  if (!d || typeof d !== 'object') {
    return {
      totalUsers: null,
      totalCollectors: null,
      totalRequests: null,
      statusBreakdown: {},
      dispositionStats: {},
      totalItems: null,
    }
  }

  const req = d.requests
  const statusFromNested =
    req && typeof req === 'object'
      ? {
          pending: coerceNum(req.pending),
          assigned: coerceNum(req.assigned),
          completed: coerceNum(req.completed),
          cancelled: coerceNum(req.cancelled),
        }
      : {}

  const disp = d.dispositionStats ?? d.disposition
  const dispositionStats =
    disp && typeof disp === 'object'
      ? {
          recycled: coerceNum(disp.recycled),
          reused: coerceNum(disp.reused),
          disposed: coerceNum(disp.disposed),
        }
      : {}

  return {
    totalUsers: coerceNum(d.totalUsers ?? d.users),
    totalCollectors: coerceNum(d.totalCollectors ?? d.collectors),
    totalRequests: coerceNum(d.totalRequests ?? req?.total_requests),
    statusBreakdown: d.statusBreakdown && typeof d.statusBreakdown === 'object' ? d.statusBreakdown : statusFromNested,
    dispositionStats,
    totalItems: coerceNum(d.total_items),
  }
}

function BreakdownRow({ label, value, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-800',
    amber: 'bg-amber-100 text-amber-900',
    sky: 'bg-sky-100 text-sky-900',
    green: 'bg-emerald-100 text-emerald-900',
    rose: 'bg-rose-100 text-rose-900',
  }
  const v = value != null ? value : '—'
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
      <span className="text-sm text-slate-600 capitalize">{label}</span>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone] || tones.slate}`}>{v}</span>
    </div>
  )
}

export function AdminDashboard() {
  const dash = useAsync(adminService.dashboard)

  useEffect(() => {
    dash.run()
  }, [dash.run])

  const stats = useMemo(() => normalizeDashboard(dash.data), [dash.data])

  const sb = stats.statusBreakdown || {}
  const disp = stats.dispositionStats || {}

  const hasStatus =
    sb &&
    Object.keys(sb).length > 0 &&
    Object.values(sb).some((x) => x != null && x !== '')

  const hasDisp =
    disp &&
    Object.keys(disp).length > 0 &&
    Object.values(disp).some((x) => x != null && x !== '')

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">Admin Dashboard</div>
        <div className="text-sm text-slate-600">Platform overview and statistics.</div>
      </div>

      {dash.loading ? (
        <Card className="flex items-center gap-2 p-6 text-sm text-slate-600">
          <Spinner />
          Loading…
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total users" value={stats.totalUsers} icon={Users} />
            <StatCard label="Total collectors" value={stats.totalCollectors} icon={Users} tone="sky" />
            <StatCard label="Total requests" value={stats.totalRequests} icon={ClipboardList} tone="brand" />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <div className="mb-3 text-sm font-semibold text-slate-900">Status breakdown</div>
              {hasStatus ? (
                <div className="space-y-2">
                  {sb.pending != null ? <BreakdownRow label="Pending" value={sb.pending} tone="amber" /> : null}
                  {sb.assigned != null ? <BreakdownRow label="Assigned" value={sb.assigned} tone="sky" /> : null}
                  {sb.completed != null ? <BreakdownRow label="Completed" value={sb.completed} tone="green" /> : null}
                  {sb.cancelled != null ? <BreakdownRow label="Cancelled" value={sb.cancelled} tone="rose" /> : null}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No status breakdown data.</p>
              )}
            </Card>
            <Card className="p-5">
              <div className="mb-3 text-sm font-semibold text-slate-900">Disposition stats</div>
              {hasDisp ? (
                <div className="space-y-2">
                  {disp.recycled != null ? <BreakdownRow label="Recycled" value={disp.recycled} tone="green" /> : null}
                  {disp.reused != null ? <BreakdownRow label="Reused" value={disp.reused} tone="sky" /> : null}
                  {disp.disposed != null ? <BreakdownRow label="Disposed" value={disp.disposed} tone="slate" /> : null}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No disposition data yet.</p>
              )}
            </Card>
          </div>

          {stats.totalItems != null ? (
            <Card className="p-4">
              <div className="text-xs font-medium text-slate-500">Total e-waste items (quantity sum)</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">{stats.totalItems}</div>
            </Card>
          ) : null}
        </>
      )}
    </div>
  )
}
