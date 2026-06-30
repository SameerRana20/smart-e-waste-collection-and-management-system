import { useEffect } from 'react'
import { Card } from '../../components/ui/Card.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { collectorService } from '../../services/collectorService.js'

export function CollectorProfile() {
  const profileReq = useAsync(collectorService.me)

  useEffect(() => {
    profileReq.run()
  }, [profileReq.run])

  const profile = profileReq.data?.data ?? null

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">Collector Profile</div>
        <div className="text-sm text-slate-600">Your account details.</div>
      </div>

      <Card className="p-5">
        {profileReq.loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner />
            Loading…
          </div>
        ) : !profile ? (
          <div className="text-sm text-slate-700">Unable to load collector profile.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name" value={profile.fullName} />
            <Field label="Email" value={profile.email} />
            <Field label="Phone" value={profile.phone} />
            <Field label="City" value={profile.city} />
            <Field label="Vehicle number" value={profile.vehicleNumber} />
            <Field label="Organization" value={profile.organizationName} />
            <Field label="Status" value={profile.verificationStatus} />
            <Field label="Collector ID" value={profile.collectorId} />
          </div>
        )}
      </Card>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
        {value ?? '—'}
      </div>
    </div>
  )
}

