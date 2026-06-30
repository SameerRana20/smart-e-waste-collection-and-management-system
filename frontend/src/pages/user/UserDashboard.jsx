import { ClipboardList, Clock, CheckCircle2, Gift, Truck, CalendarClock } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { userService } from '../../services/userService.js'

function normalizeList(res) {
  const d = res?.data ?? res
  return Array.isArray(d) ? d : d?.data || []
}

function formatScheduledPickup(v) {
  if (v == null || v === '') return null
  const s = typeof v === 'string' ? v : String(v)
  const iso = s.length >= 10 ? s.slice(0, 10) : s
  const d = new Date(`${iso}T12:00:00`)
  return Number.isFinite(d.getTime())
    ? d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
    : s
}

function statusTone(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'pending') return 'yellow'
  if (s === 'assigned') return 'blue'
  if (s === 'completed') return 'green'
  if (s === 'cancelled') return 'red'
  return 'slate'
}

function coerceStats(data) {
  const d = data?.data ?? null
  const total = d?.total_requests ?? null
  const pending = d?.pending_requests ?? null
  const assigned = d?.assigned_requests ?? null
  const completed = d?.completed_requests ?? null
  return { total, pending, assigned, completed, raw: d }
}

export function UserDashboard() {
  const statsReq = useAsync(userService.getDashboardStats)
  const pointsReq = useAsync(userService.getMyPoints)
  const requests = useAsync(userService.listMyRequests)

  useEffect(() => {
    statsReq.run()
    pointsReq.run()
    requests.run()
  }, [statsReq.run, pointsReq.run, requests.run])

  const stats = coerceStats(statsReq.data)
  const rewardPoints = pointsReq.data?.data?.rewardPoints ?? null

  const rows = useMemo(() => normalizeList(requests.data), [requests.data])

  const withPickupSorted = useMemo(() => {
    return rows
      .filter((r) => r.scheduled_pickup_date != null && r.scheduled_pickup_date !== '')
      .slice()
      .sort((a, b) => {
        const da = new Date(a.scheduled_pickup_date).getTime()
        const db = new Date(b.scheduled_pickup_date).getTime()
        return db - da
      })
  }, [rows])

  const nextPickupRow = useMemo(() => {
    if (!withPickupSorted.length) return null
    const active = withPickupSorted.filter((r) =>
      ['assigned', 'pending'].includes(String(r.status || '').toLowerCase()),
    )
    const pool = active.length ? active : withPickupSorted
    return [...pool].sort((a, b) => {
      const da = new Date(a.scheduled_pickup_date).getTime()
      const db = new Date(b.scheduled_pickup_date).getTime()
      return da - db
    })[0]
  }, [withPickupSorted])

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">Dashboard</div>
        <div className="text-sm text-slate-600">
          Overview of your e‑waste pickup requests, next pickup, and scheduled dates.
        </div>
      </div>

      {statsReq.loading ? (
        <Card className="flex items-center justify-center p-10 text-slate-600">
          <Spinner />
          <span className="ml-2 text-sm">Loading…</span>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total requests" value={stats.total} icon={ClipboardList} />
          <StatCard label="Pending" value={stats.pending} icon={Clock} tone="amber" />
          <StatCard label="Assigned" value={stats.assigned} icon={Truck} tone="sky" />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} tone="brand" />
        </div>
      )}

      <Card className="p-5">
        <div className="flex flex-wrap items-start gap-6">
          <div className="min-w-0 flex-1">
            {pointsReq.loading ? (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Spinner />
                Loading reward points…
              </div>
            ) : (
              <div className="flex items-center gap-3 text-brand-700">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500">Reward points</div>
                  <div className="text-3xl font-semibold text-slate-900">{rewardPoints ?? '—'}</div>
                </div>
              </div>
            )}
          </div>

          <div className="min-w-[220px] flex-1 border-t border-slate-100 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pickup time</div>
            {requests.loading ? (
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <Spinner />
                Loading…
              </div>
            ) : nextPickupRow ? (
              <div className="mt-2 rounded-2xl border-2 border-brand-300 bg-gradient-to-br from-brand-50 to-white px-3 py-2.5 shadow-sm">
                <div className="flex items-center gap-2 text-brand-900">
                  <CalendarClock className="h-5 w-5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900">
                      {formatScheduledPickup(nextPickupRow.scheduled_pickup_date)}
                    </div>
                    <div className="text-xs text-slate-600">
                      Request #{nextPickupRow.request_id ?? nextPickupRow.requestId ?? '—'} ·{' '}
                      <span className="capitalize">{nextPickupRow.status || '—'}</span>
                    </div>
                  </div>
                </div>
                {(nextPickupRow.request_id ?? nextPickupRow.requestId) != null ? (
                  <Link
                    to={`/requests/${nextPickupRow.request_id ?? nextPickupRow.requestId}`}
                    className="mt-2 inline-block text-xs font-semibold text-brand-800 underline"
                  >
                    Open request details
                  </Link>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                No pickup scheduled yet. When a collector approves a request, the date will show here.
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">All scheduled pickups</div>
          <div className="mt-0.5 text-xs text-slate-500">Sorted by pickup date, newest first.</div>
        </div>
        {requests.loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-slate-600">
            <Spinner />
            Loading…
          </div>
        ) : withPickupSorted.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Request</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Pickup date</th>
                  <th className="px-4 py-3 text-right"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {withPickupSorted.map((r) => {
                  const id = r.request_id ?? r.requestId
                  const label = formatScheduledPickup(r.scheduled_pickup_date)
                  return (
                    <tr key={id != null ? String(id) : String(r.scheduled_pickup_date)}>
                      <td className="px-4 py-3 font-medium text-slate-900">{id ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(r.status)} className="capitalize">
                          {r.status || '—'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-900">
                          <CalendarClock className="h-4 w-4 shrink-0 text-brand-700" />
                          {label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {id != null ? (
                          <Link to={`/requests/${id}`} className="font-medium text-brand-700 hover:underline">
                            Details
                          </Link>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-8 text-center text-sm text-slate-600">
            No scheduled pickup dates yet. When a collector approves a request, the date will appear here.
          </div>
        )}
      </Card>
    </div>
  )
}

