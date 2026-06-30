import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { userService } from '../../services/userService.js'

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

export function MyRequests() {
  const list = useAsync(userService.listMyRequests)
  const del = useAsync(userService.deleteRequest)
  const [confirm, setConfirm] = useState({ open: false, req: null })

  useEffect(() => {
    list.run()
  }, [list.run])

  const rows = useMemo(() => normalizeList(list.data), [list.data])

  async function onDelete() {
    const req = confirm.req
    const requestId = req?.request_id
    if (!requestId) return
    await del.run(requestId)
    toast.success('Request deleted')
    setConfirm({ open: false, req: null })
    list.run()
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">My Requests</div>
        <div className="text-sm text-slate-600">Track the status of your requests.</div>
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
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows?.length ? (
                  rows.map((r) => (
                    <tr key={r.request_id} className="hover:bg-white">
                      <td className="px-4 py-3">
                        <Link
                          to={`/requests/${r.request_id}`}
                          className="font-medium text-brand-700 hover:underline"
                        >
                          {r.request_id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {r.request_date ? new Date(r.request_date).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={statusTone(r.status)}>{r.status || '—'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={String(r.status || '').toLowerCase() !== 'pending'}
                            onClick={() => setConfirm({ open: true, req: r })}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-600" colSpan="4">
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        open={confirm.open}
        title="Delete request?"
        onClose={() => setConfirm({ open: false, req: null })}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm({ open: false, req: null })}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onDelete} disabled={del.loading}>
              {del.loading ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        }
      >
        <div className="text-sm text-slate-600">
          This action is only allowed when status is <span className="font-medium">pending</span>.
        </div>
      </Modal>
    </div>
  )
}

