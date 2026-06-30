import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Input } from '../../components/ui/Input.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Select } from '../../components/ui/Select.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { collectorService } from '../../services/collectorService.js'

function normalizeList(res) {
  return res?.data ?? []
}

function statusTone(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'pending') return 'yellow'
  if (s === 'assigned') return 'blue'
  if (s === 'completed') return 'green'
  if (s === 'cancelled') return 'red'
  return 'slate'
}

export function AssignedRequests() {
  const list = useAsync(collectorService.requests)
  const details = useAsync(collectorService.requestDetails)
  const approve = useAsync(collectorService.approve)
  const reject = useAsync(collectorService.reject)
  const complete = useAsync(collectorService.complete)
  const disposition = useAsync(collectorService.recordDisposition)

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [scheduledDate, setScheduledDate] = useState('')
  const [pickupOpen, setPickupOpen] = useState(false)
  const [pickupRequestId, setPickupRequestId] = useState(null)
  const [pickup, setPickup] = useState({ dispositionType: '', remarks: '' })

  useEffect(() => {
    list.run()
  }, [list.run])

  const rows = useMemo(() => normalizeList(list.data), [list.data])
  const pendingRows = useMemo(
    () => rows.filter((r) => String(r.status || '').toLowerCase() === 'pending'),
    [rows],
  )
  const assignedRows = useMemo(
    () => rows.filter((r) => String(r.status || '').toLowerCase() === 'assigned'),
    [rows],
  )
  const completedRows = useMemo(
    () => rows.filter((r) => String(r.status || '').toLowerCase() === 'completed'),
    [rows],
  )
  useEffect(() => {
    if (import.meta?.env?.DEV) console.log('[AssignedRequests] rows:', rows)
  }, [rows])

  async function openDetails(requestId) {
    setSelectedRequestId(requestId)
    setDetailsOpen(true)
    await details.run(requestId)
  }

  async function onApprove() {
    if (!selectedRequestId || !scheduledDate) return
    await approve.run(selectedRequestId, { scheduledDate })
    toast.success('Request approved')
    setDetailsOpen(false)
    setScheduledDate('')
    await list.run()
  }

  async function onReject() {
    if (!selectedRequestId) return
    await reject.run(selectedRequestId)
    toast.success('Request rejected')
    setDetailsOpen(false)
    await list.run()
  }

  async function onPickupAndDisposition() {
    if (!pickupRequestId || !pickup.dispositionType) return
    await complete.run(pickupRequestId)
    await disposition.run(pickupRequestId, {
      dispositionType: pickup.dispositionType,
      remarks: pickup.remarks || '',
    })
    toast.success('Request completed')
    setPickupOpen(false)
    setPickupRequestId(null)
    setPickup({ dispositionType: '', remarks: '' })
    await list.run()
  }

  const detailPayload = details.data?.data ?? details.data
  const detailItems = detailPayload?.items ?? []

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">All Requests</div>
        <div className="text-sm text-slate-600">Pending, assigned, and completed requests.</div>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <div className="text-sm font-semibold text-slate-900">Pending Requests</div>
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
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRows?.length ? (
                  pendingRows.map((r) => (
                    <tr key={r.request_id} className="hover:bg-white">
                      <td className="px-4 py-3 font-medium text-slate-900">{r.request_id}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {r.request_date ? new Date(r.request_date).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(r.status)} className="capitalize">
                          {r.status || '—'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" onClick={() => openDetails(r.request_id)}>
                            View Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-600" colSpan="4">
                      No pending requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <div className="text-sm font-semibold text-slate-900">Assigned Requests</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Request</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignedRows?.length ? (
                assignedRows.map((r) => (
                  <tr key={r.request_id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{r.request_id}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.request_date ? new Date(r.request_date).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(r.status)} className="capitalize">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDetails(r.request_id)}>
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setPickupRequestId(r.request_id)
                            setPickupOpen(true)
                          }}
                        >
                          Collected
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-10 text-center text-slate-600" colSpan="4">
                    No assigned requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 p-4">
          <div className="text-sm font-semibold text-slate-900">Completed Requests</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Request</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedRows?.length ? (
                completedRows.map((r) => (
                  <tr key={r.request_id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{r.request_id}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {r.request_date ? new Date(r.request_date).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone(r.status)} className="capitalize">
                        {r.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-10 text-center text-slate-600" colSpan="3">
                    No completed requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={detailsOpen}
        title={`Request #${selectedRequestId || ''}`}
        onClose={() => setDetailsOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            {String(detailPayload?.status || '').toLowerCase() === 'pending' ? (
              <>
                <Button variant="outline" onClick={onReject} disabled={reject.loading}>
                  {reject.loading ? 'Rejecting…' : 'Reject'}
                </Button>
                <Button onClick={onApprove} disabled={approve.loading || !scheduledDate}>
                  {approve.loading ? 'Approving…' : 'Approve'}
                </Button>
              </>
            ) : null}
          </div>
        }
      >
        {details.loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner />
            Loading details…
          </div>
        ) : (
          <div className="space-y-4">
            {String(detailPayload?.status || '').toLowerCase() === 'pending' ? (
              <Input
                label="Scheduled date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            ) : null}
            <div className="space-y-3">
              {detailItems?.length ? (
                detailItems.map((it) => (
                  <div key={it.item_id} className="rounded-2xl border border-slate-200 p-3">
                    <div className="text-sm font-semibold text-slate-900">{it.type || 'Item'}</div>
                    <div className="text-sm text-slate-600">
                      Qty: {it.quantity ?? '—'} · Condition: {it.condition ?? '—'}
                    </div>
                    <div className="text-sm text-slate-600">Description: {it.description || '—'}</div>
                    {Array.isArray(it.images) && it.images.length ? (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {it.images.map((url) => (
                          <img key={url} src={url} alt="item" className="h-20 w-full rounded-lg object-cover" />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-600">No items found.</div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={pickupOpen}
        title={`Complete request #${pickupRequestId || ''}`}
        onClose={() => setPickupOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPickupOpen(false)}>
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
          <Select
            label="Disposition type"
            value={pickup.dispositionType}
            onChange={(e) => setPickup((s) => ({ ...s, dispositionType: e.target.value }))}
          >
            <option value="">Select</option>
            <option value="recycled">Recycled</option>
            <option value="reused">Reused</option>
            <option value="disposed">Disposed</option>
          </Select>
          <Input
            label="Remarks (optional)"
            value={pickup.remarks}
            onChange={(e) => setPickup((s) => ({ ...s, remarks: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  )
}

