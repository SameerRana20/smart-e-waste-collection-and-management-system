import { useEffect, useMemo } from 'react'
import { CheckCircle2, ClipboardList, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { StatCard } from '../../components/ui/StatCard.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { collectorService } from '../../services/collectorService.js'

function rowsFromResponse(data) {
  const raw = data?.data ?? data
  return Array.isArray(raw) ? raw : []
}

function normalize(data) {
  const rows = rowsFromResponse(data)
  const pending = rows.filter((r) => String(r.status || '').toLowerCase() === 'pending').length
  const assigned = rows.filter((r) => String(r.status || '').toLowerCase() === 'assigned').length
  const completed = rows.filter((r) => String(r.status || '').toLowerCase() === 'completed').length
  const recent = [...rows]
    .sort((a, b) => {
      const da = new Date(a.request_date || a.requestDate || 0).getTime()
      const db = new Date(b.request_date || b.requestDate || 0).getTime()
      return db - da
    })
    .slice(0, 10)
  return {
    pending,
    assigned,
    completed,
    recent,
  }
}

function statusTone(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'pending') return 'yellow'
  if (s === 'assigned') return 'blue'
  if (s === 'completed') return 'green'
  if (s === 'cancelled') return 'red'
  return 'slate'
}

function formatDate(v) {
  if (!v) return '—'
  const d = v instanceof Date ? v : new Date(v)
  return Number.isFinite(d.getTime()) ? d.toLocaleString() : '—'
}

function formatPickupDate(v) {
  if (v == null || v === '') return '—'
  const s = typeof v === 'string' ? v : String(v)
  const iso = s.length >= 10 ? s.slice(0, 10) : s
  const d = new Date(`${iso}T12:00:00`)
  return Number.isFinite(d.getTime())
    ? d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : '—'
}

export function CollectorDashboard() {
  const dash = useAsync(collectorService.requests)

  useEffect(() => {
    dash.run().catch(() => {})
  }, [dash.run])

  const stats = useMemo(() => normalize(dash.data), [dash.data])

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">Collector Dashboard</div>
        <div className="text-sm text-slate-600">Manage assigned pickup requests.</div>
      </div>

      {dash.loading ? (
        <Card className="flex items-center gap-2 p-6 text-sm text-slate-600">
          <Spinner />
          Loading…
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard label="Pending requests" value={stats.pending} icon={Clock} tone="amber" />
            <StatCard label="Assigned requests" value={stats.assigned} icon={ClipboardList} tone="sky" />
            <StatCard label="Completed requests" value={stats.completed} icon={CheckCircle2} tone="brand" />
            <Card className="p-4 text-sm text-slate-700">
              View and manage all your requests.
              <div className="mt-2">
                <Link to="/collector/requests" className="font-medium text-brand-700 hover:underline">
                  Open All Requests
                </Link>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="text-sm font-semibold text-slate-900">Recent requests</div>
              <div className="mt-0.5 text-xs text-slate-500">
                Latest activity across your queue (newest first). Open a row for full details and actions.
              </div>
            </div>
            {stats.recent.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Request ID</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Scheduled pickup</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recent.map((r, idx) => {
                      const id = r.request_id ?? r.requestId ?? r.id
                      return (
                        <tr key={id != null ? String(id) : `row-${idx}`}>
                          <td className="px-4 py-3 font-medium text-slate-900">{id ?? '—'}</td>
                          <td className="px-4 py-3">
                            <Badge tone={statusTone(r.status)} className="capitalize">
                              {r.status || '—'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {r.scheduled_pickup_date ? (
                              <span className="inline-flex rounded-lg border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-900">
                                {formatPickupDate(r.scheduled_pickup_date)}
                              </span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{formatDate(r.request_date ?? r.requestDate)}</td>
                          <td className="px-4 py-3 text-right">
                            {id != null ? (
                              <Link
                                to={`/collector/requests/${id}`}
                                className="font-medium text-brand-700 hover:underline"
                              >
                                View
                              </Link>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-slate-600">No requests assigned to you yet.</div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
