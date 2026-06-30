import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { userService } from '../../services/userService.js'

function statusTone(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'pending') return 'yellow'
  if (s === 'assigned' || s === 'approved') return 'blue'
  if (s === 'completed') return 'green'
  if (s === 'rejected') return 'red'
  return 'slate'
}

/** Unwrap apiResponse: { data: payload } and optional double-wrap. */
function normalizeDetails(res) {
  if (!res) return { request: null, items: [] }
  let body = res?.data ?? res
  if (body && typeof body === 'object' && body.data != null && body.request_id == null && !Array.isArray(body.data)) {
    const inner = body.data
    if (inner && typeof inner === 'object' && (inner.request_id != null || inner.items != null || inner.status != null)) {
      body = inner
    }
  }
  const request = body?.request ?? body
  const items = Array.isArray(body?.items)
    ? body.items
    : Array.isArray(request?.items)
      ? request.items
      : []
  return { request: request && typeof request === 'object' ? request : null, items }
}

function formatScheduledPickup(v) {
  if (v == null || v === '') return null
  if (v instanceof Date) {
    return Number.isFinite(v.getTime())
      ? v.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : null
  }
  const s = typeof v === 'string' ? v : String(v)
  const iso = s.length >= 10 ? s.slice(0, 10) : s
  const d = new Date(`${iso}T12:00:00`)
  return Number.isFinite(d.getTime())
    ? d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : s
}

export function RequestDetailsUser() {
  const { id } = useParams()
  const [raw, setRaw] = useState(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    userService
      .getRequest(id)
      .then((res) => {
        if (!cancelled) setRaw(res)
      })
      .catch((e) => {
        if (!cancelled) setError(e)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const { request, items } = useMemo(() => normalizeDetails(raw), [raw])

  const scheduledLabel = useMemo(() => {
    const rawDate = request?.scheduled_pickup_date ?? request?.scheduledDate ?? request?.scheduled_pickup
    return formatScheduledPickup(rawDate)
  }, [request])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-slate-900">Request Details</div>
          <div className="text-sm text-slate-600">Request ID: {id}</div>
        </div>
        <Badge tone={statusTone(request?.status)} className="capitalize">
          {request?.status || (loading ? '…' : '—')}
        </Badge>
      </div>

      {error ? (
        <Card className="border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Could not load this request. {error?.message ? `(${error.message})` : ''}
          <div className="mt-2">
            <Link to="/requests" className="font-medium text-brand-800 underline">
              Back to My Requests
            </Link>
          </div>
        </Card>
      ) : null}

      {!loading && scheduledLabel ? (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-white px-4 py-3 shadow-sm ring-1 ring-brand-100">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-800">Scheduled pickup</div>
            <div className="text-base font-semibold text-slate-900">{scheduledLabel}</div>
            <div className="text-xs text-slate-600">Set by your collector when this request was approved.</div>
          </div>
        </div>
      ) : null}

      {loading ? (
        <Card className="flex items-center gap-2 p-6 text-sm text-slate-600">
          <Spinner />
          Loading…
        </Card>
      ) : error ? null : (
        <div className="space-y-4">
          <Card className="p-5">
            <div className="mb-3 text-sm font-semibold text-slate-900">Items</div>
            <div className="space-y-3">
              {items?.length ? (
                items.map((it) => (
                  <div key={it.item_id ?? it.id ?? it.itemId} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {it.itemType || it.type || it.item_type || 'Item'}
                        </div>
                        <div className="text-sm text-slate-600">
                          Qty: {it.quantity ?? '—'} · Condition: {it.condition ?? it.condition_desc ?? '—'}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Item ID: {it.item_id ?? it.id ?? it.itemId ?? '—'}
                        </div>
                      </div>
                    </div>

                    {Array.isArray(it.images) && it.images.length ? (
                      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {it.images.map((img) => {
                          const url = img.url || img.imageUrl || img.path || img
                          return (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="group overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                            >
                              <img
                                src={url}
                                alt="Item"
                                className="h-28 w-full object-cover transition group-hover:scale-[1.02]"
                                loading="lazy"
                              />
                            </a>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-600">No items found.</div>
              )}
            </div>
          </Card>
          <div className="text-sm">
            <Link to="/requests" className="font-medium text-brand-700 hover:underline">
              ← Back to My Requests
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
