import { useEffect, useMemo } from 'react'
import { Gift } from 'lucide-react'
import { Card } from '../../components/ui/Card.jsx'
import { Spinner } from '../../components/ui/Spinner.jsx'
import { useAsync } from '../../hooks/useAsync.js'
import { userService } from '../../services/userService.js'

export function Rewards() {
  const points = useAsync(userService.getMyPoints)

  useEffect(() => {
    points.run()
  }, [points.run])

  const rewardPoints = useMemo(() => {
    const d = points.data?.data ?? points.data
    return d?.rewardPoints ?? d?.data?.rewardPoints ?? 0
  }, [points.data])

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xl font-semibold text-slate-900">Rewards</div>
        <div className="text-sm text-slate-600">Your recycling reward points.</div>
      </div>

      <Card className="p-5">
        {points.loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Spinner />
            Loading points…
          </div>
        ) : (
          <div className="flex items-center gap-3 text-brand-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Reward points</div>
              <div className="text-3xl font-semibold text-slate-900">{rewardPoints}</div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
