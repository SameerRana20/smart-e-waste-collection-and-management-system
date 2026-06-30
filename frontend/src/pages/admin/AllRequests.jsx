import { useEffect, useMemo } from 'react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { adminService } from '../../services/adminService.js'

function normalizeList(res) {
  const d = res?.data ?? res
  return Array.isArray(d) ? d : Array.isArray(d?.requests) ? d.requests : d?.data || []
}

/** Backend getAllRequestsDetailed: request_id, status, request_date, user_name, city, collector_name, disposition_type */
function requestKey(r) {
  return r.request_id ?? r.requestId ?? r.id
}

function formatDate(v) {
  if (!v) return '—'
  const d = v instanceof Date ? v : new Date(v)
  return Number.isFinite(d.getTime()) ? d.toLocaleString() : String(v)
}

function statusTone(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'pending') return 'yellow'
  if (s === 'assigned' || s === 'approved' || s === 'scheduled') return 'blue'
  if (s === 'completed') return 'green'
  if (s === 'rejected' || s === 'cancelled') return 'red'
  return 'slate'
}

export function AllRequests() {
  const list = useAsync(adminService.allRequestsDetailed)

  useEffect(() => {
    list.run()
  }, [list.run])

  const rows = useMemo(() => normalizeList(list.data), [list.data])

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">All Requests</div>
        <div className="text-sm text-slate-600">Detailed requests across the platform.</div>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <div className="text-sm font-semibold text-slate-900">Requests</div>
        </div>
        {list.loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-slate-600">
            <Spinner />
            Loading…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Request</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Collector</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Disposition</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows?.length ? (
                  rows.map((r, idx) => {
                    const rid = requestKey(r)
                    const userLine =
                      r.user_name ??
                      r.userName ??
                      r.user?.full_name ??
                      r.user?.name ??
                      r.user?.email ??
                      r.userEmail ??
                      null
                    const city = r.city ?? r.user?.city
                    return (
                      <tr key={rid != null ? String(rid) : `req-${idx}`}>
                        <td className="px-4 py-3 font-medium text-slate-900">{rid ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-600">
                          <div>{userLine || '—'}</div>
                          {city ? <div className="text-xs text-slate-500">{city}</div> : null}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{r.collector_name ?? r.collectorName ?? '—'}</td>
                        <td className="px-4 py-3">
                          <Badge tone={statusTone(r.status)} className="capitalize">
                            {r.status || '—'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 capitalize text-slate-600">
                          {r.disposition_type ?? r.dispositionType ?? r.disposition?.type ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(r.request_date ?? r.requestDate ?? r.createdAt)}</td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-600" colSpan="6">
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
