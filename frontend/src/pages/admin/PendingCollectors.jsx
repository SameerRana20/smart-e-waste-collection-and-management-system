import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Building2, Hash, Mail, MapPin, Phone, Truck } from 'lucide-react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Modal } from '../../components/ui/Modal.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { adminService } from '../../services/adminService.js'

function normalizeList(res) {
  const d = res?.data ?? res
  return Array.isArray(d) ? d : Array.isArray(d?.collectors) ? d.collectors : d?.data || []
}

/** Backend returns `collector_id` and `full_name` (see collector.model getPendingCollectors). */
function collectorId(row) {
  return row?.collector_id ?? row?.id
}

function collectorName(row) {
  return row?.full_name ?? row?.name ?? '—'
}

function CollectorDetailFields({ c, dense }) {
  const id = collectorId(c)
  const fields = [
    { label: 'Email', value: c.email, icon: Mail },
    { label: 'Phone', value: c.phone, icon: Phone },
    { label: 'City', value: c.city, icon: MapPin },
    { label: 'Vehicle number', value: c.vehicle_number, icon: Truck },
    { label: 'Organization', value: c.organization_name, icon: Building2 },
    { label: 'Collector ID', value: id != null ? String(id) : null, icon: Hash },
  ]

  return (
    <dl
      className={
        dense
          ? 'grid gap-2.5 sm:grid-cols-2'
          : 'mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2'
      }
    >
      {fields.map(({ label, value, icon: Icon }) => (
        <div key={label} className="min-w-0">
          <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
            {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden /> : null}
            {label}
          </dt>
          <dd className="mt-1 break-words text-sm text-slate-900">{value || '—'}</dd>
        </div>
      ))}
    </dl>
  )
}

export function PendingCollectors() {
  const list = useAsync(adminService.pendingCollectors)
  const approve = useAsync(adminService.approveCollector)
  const reject = useAsync(adminService.rejectCollector)

  const [confirm, setConfirm] = useState({ open: false, action: null, collector: null })

  const rows = useMemo(() => normalizeList(list.data), [list.data])

  useEffect(() => {
    list.run()
  }, [list.run])

  async function onConfirm() {
    const c = confirm.collector
    const id = collectorId(c)
    if (!id) {
      toast.error('Missing collector id')
      return
    }
    try {
      if (confirm.action === 'approve') {
        await approve.run(id)
        toast.success('Collector approved')
      } else if (confirm.action === 'reject') {
        await reject.run(id)
        toast.success('Collector rejected')
      }
      setConfirm({ open: false, action: null, collector: null })
      list.run()
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Request failed'
      toast.error(msg)
    }
  }

  const busy = approve.loading || reject.loading

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">Pending Collectors</div>
        <div className="text-sm text-slate-600">
          Review full application details in each card, then approve or reject.
        </div>
      </div>

      {list.loading ? (
        <Card className="flex items-center gap-2 p-8 text-sm text-slate-600">
          <Spinner />
          Loading…
        </Card>
      ) : rows?.length ? (
        <div className="space-y-4">
          {rows.map((c) => (
            <Card key={String(collectorId(c) ?? c.email)} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{collectorName(c)}</h2>
                    <Badge tone="yellow">{c.verification_status || c.status || 'pending'}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Details from the collector&apos;s registration.</p>
                </div>
              </div>

              <CollectorDetailFields c={c} />

              <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfirm({ open: true, action: 'reject', collector: c })}
                >
                  Reject
                </Button>
                <Button size="sm" onClick={() => setConfirm({ open: true, action: 'approve', collector: c })}>
                  Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center text-sm text-slate-600">No pending collectors.</Card>
      )}

      <Modal
        open={confirm.open}
        title={`${confirm.action === 'approve' ? 'Approve' : 'Reject'} this collector?`}
        onClose={() => setConfirm({ open: false, action: null, collector: null })}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm({ open: false, action: null, collector: null })}>
              Cancel
            </Button>
            <Button
              variant={confirm.action === 'reject' ? 'danger' : 'primary'}
              onClick={onConfirm}
              disabled={busy}
            >
              {busy ? 'Saving…' : confirm.action === 'reject' ? 'Reject collector' : 'Approve collector'}
            </Button>
          </div>
        }
      >
        {confirm.collector ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              You are about to {confirm.action === 'approve' ? 'approve' : 'reject'}{' '}
              <span className="font-medium text-slate-900">{collectorName(confirm.collector)}</span>. Confirm the
              details below match your review.
            </p>
            <CollectorDetailFields c={confirm.collector} dense />
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
