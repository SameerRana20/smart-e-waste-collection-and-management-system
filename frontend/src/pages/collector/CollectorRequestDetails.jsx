import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CalendarClock } from 'lucide-react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { collectorService } from '../../services/collectorService.js'

function statusTone(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'pending') return 'yellow'
  if (s === 'approved' || s === 'assigned' || s === 'scheduled') return 'blue'
  if (s === 'completed') return 'green'
  if (s === 'rejected') return 'red'
  return 'slate'
}

function normalizeDetails(res) {
  const d = res?.data ?? res
  const request = d?.request ?? d
  const items = d?.items ?? request?.items ?? []
  return { request, items }
}

function formatScheduledPickup(v) {
  if (v == null || v === '') return null
  const s = typeof v === 'string' ? v : String(v)
  const iso = s.length >= 10 ? s.slice(0, 10) : s
  const d = new Date(`${iso}T12:00:00`)
  return Number.isFinite(d.getTime())
    ? d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : s
}

export function CollectorRequestDetails() {
  const { id } = useParams()
  const details = useAsync(collectorService.requestDetails)
  const approve = useAsync(collectorService.approve)
  const reject = useAsync(collectorService.reject)
  const complete = useAsync(collectorService.complete)
  const disposition = useAsync(collectorService.recordDisposition)

  const [approveOpen, setApproveOpen] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [pickupOpen, setPickupOpen] = useState(false)
  const [pickup, setPickup] = useState({ dispositionType: '', remarks: '' })

  useEffect(() => {
    if (id) void details.run(id)
  }, [id, details.run])

  const { request, items } = useMemo(() => normalizeDetails(details.data), [details.data])

  const scheduledLabel = useMemo(() => {
    const raw = request?.scheduled_pickup_date ?? request?.scheduledDate
    return formatScheduledPickup(raw)
  }, [request])

  async function onApprove() {
    if (!scheduledDate || !id) return
    await approve.run(id, { scheduledDate })
    toast.success('Request approved and pickup scheduled')
    setApproveOpen(false)
    await details.run(id)
  }

  async function onReject() {
    if (!id) return
    await reject.run(id)
    toast.success('Request rejected')
    await details.run(id)
  }

  async function onPickupAndDisposition() {
    if (!pickup.dispositionType || !id) return
    try {
      await complete.run(id)
      await disposition.run(id, {
        dispositionType: pickup.dispositionType,
        remarks: pickup.remarks || '',
      })
      await details.run(id)
      toast.success('Request marked completed')
      setPickupOpen(false)
      setPickup({ dispositionType: '', remarks: '' })
    } catch (e) {
      throw e
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold text-slate-900">Request Details</div>
          <div className="text-sm text-slate-600">Request ID: {id}</div>
        </div>
        <Badge tone={statusTone(request?.status)} className="capitalize">
          {request?.status || '—'}
        </Badge>
      </div>

      {scheduledLabel ? (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-white px-4 py-3 shadow-sm ring-1 ring-brand-100">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-800">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-800">Scheduled pickup</div>
            <div className="text-base font-semibold text-slate-900">{scheduledLabel}</div>
            <div className="text-xs text-slate-600">Set when this request was approved.</div>
          </div>
        </div>
      ) : null}

      <Card className="p-5">
        <div className="flex flex-wrap gap-2">
          {String(request?.status || '').toLowerCase() === 'pending' ? (
            <>
              <Button variant="outline" onClick={() => setApproveOpen(true)}>
                Approve / Schedule
              </Button>
              <Button variant="outline" onClick={onReject} disabled={reject.loading}>
                {reject.loading ? 'Rejecting…' : 'Reject'}
              </Button>
            </>
          ) : null}

          {String(request?.status || '').toLowerCase() === 'assigned' ? (
            <Button onClick={() => setPickupOpen(true)} disabled={complete.loading || disposition.loading}>
              Complete Pickup
            </Button>
          ) : null}
        </div>
      </Card>

      {details.loading ? (
        <Card className="flex items-center gap-2 p-6 text-sm text-slate-600">
          <Spinner />
          Loading…
        </Card>
      ) : (
        <Card className="p-5">
          <div className="mb-3 text-sm font-semibold text-slate-900">Items</div>
          <div className="space-y-3">
            {items?.length ? (
              items.map((it) => (
                <div key={it.item_id ?? it.id ?? it.itemId} className="rounded-2xl border border-slate-200 p-4">
                  <div className="text-sm font-semibold text-slate-900">
                    {it.itemType || it.type || it.item_type || 'Item'}
                  </div>
                  <div className="text-sm text-slate-600">
                    Qty: {it.quantity ?? '—'} · Condition: {it.condition ?? it.condition_desc ?? '—'}
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
                            className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                          >
                            <img
                              src={url}
                              alt="Item"
                              className="h-28 w-full object-cover"
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
              <div className="text-sm text-slate-600">No items returned.</div>
            )}
          </div>
        </Card>
      )}

      <Modal
        open={approveOpen}
        title="Approve request"
        onClose={() => setApproveOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onApprove} disabled={approve.loading || !scheduledDate}>
              {approve.loading ? 'Saving…' : 'Approve'}
            </Button>
          </div>
        }
      >
        <Input
          label="Scheduled date"
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          hint='Format: "YYYY-MM-DD"'
        />
      </Modal>

      <Modal
        open={pickupOpen}
        title="Complete pickup"
        onClose={() => {
          if (complete.loading || disposition.loading) return
          setPickupOpen(false)
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setPickupOpen(false)}
              disabled={complete.loading || disposition.loading}
            >
              Cancel
            </Button>
            <Button
              onClick={onPickupAndDisposition}
              disabled={!pickup.dispositionType || complete.loading || disposition.loading}
            >
              {complete.loading || disposition.loading ? 'Submitting…' : 'Submit'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="font-medium text-slate-900">Request summary</div>
            <div className="mt-1">Request ID: {id}</div>
            <div>Items: {items?.length ?? 0}</div>
          </div>

          <div className="text-sm font-medium text-slate-700">What happened to the e‑waste?</div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setPickup((s) => ({ ...s, dispositionType: 'recycled' }))}
              className={`rounded-2xl border px-3 py-2 text-sm font-medium ${
                pickup.dispositionType === 'recycled'
                  ? 'border-brand-300 bg-brand-50 text-brand-800'
                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              Recycled
            </button>
            <button
              type="button"
              onClick={() => setPickup((s) => ({ ...s, dispositionType: 'reused' }))}
              className={`rounded-2xl border px-3 py-2 text-sm font-medium ${
                pickup.dispositionType === 'reused'
                  ? 'border-brand-300 bg-brand-50 text-brand-800'
                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              Reused
            </button>
            <button
              type="button"
              onClick={() => setPickup((s) => ({ ...s, dispositionType: 'disposed' }))}
              className={`rounded-2xl border px-3 py-2 text-sm font-medium ${
                pickup.dispositionType === 'disposed'
                  ? 'border-brand-300 bg-brand-50 text-brand-800'
                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              Disposed
            </button>
          </div>

          <Input
            label="Remarks (optional)"
            value={pickup.remarks}
            onChange={(e) => setPickup((s) => ({ ...s, remarks: e.target.value }))}
          />
          <div className="text-xs text-slate-500">
            On submit, the app will mark pickup as completed, then record disposition.
          </div>
        </div>
      </Modal>
    </div>
  )
}
