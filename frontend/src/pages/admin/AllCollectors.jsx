import { useEffect, useMemo } from 'react'
import { Building2, Hash, Mail, MapPin, Phone, Truck } from 'lucide-react'
import { Badge } from '../../components/ui/Badge.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { adminService } from '../../services/adminService.js'

function normalizeList(res) {
  const d = res?.data ?? res
  return Array.isArray(d) ? d : Array.isArray(d?.collectors) ? d.collectors : d?.data || []
}

function collectorId(c) {
  return c?.collector_id ?? c?.id
}

function collectorName(c) {
  return c?.full_name ?? c?.name ?? '—'
}

function statusTone(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'approved') return 'green'
  if (s === 'rejected') return 'red'
  if (s === 'pending') return 'yellow'
  return 'slate'
}

function CollectorFields({ c }) {
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
    <dl className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
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

export function AllCollectors() {
  const list = useAsync(adminService.allCollectors)

  useEffect(() => {
    list.run()
  }, [list.run])

  const rows = useMemo(() => normalizeList(list.data), [list.data])

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">All Collectors</div>
        <div className="text-sm text-slate-600">Registered collectors with full registration details.</div>
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
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{collectorName(c)}</h2>
                <Badge tone={statusTone(c.verification_status || c.status)}>
                  {c.verification_status || c.status || '—'}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-slate-500">Details from the collector registration record.</p>
              <CollectorFields c={c} />
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center text-sm text-slate-600">No collectors found.</Card>
      )}
    </div>
  )
}
