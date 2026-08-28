import { DashboardData } from '@betledger/shared'
import { PNLSummary } from './PNLSummary'
import { BetList } from './BetList'

interface Props {
  data: DashboardData
  onDeleteBet: (id: string) => void
}

export function Dashboard({ data, onDeleteBet }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PNLSummary summary={data.week} title="This Week" />
        <PNLSummary summary={data.month} title="This Month" />
        <PNLSummary summary={data.year} title="This Year" />
        <PNLSummary summary={data.all_time} title="All Time" />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Recent Bets</h2>
        <BetList bets={data.recent_bets} onDelete={onDeleteBet} />
      </div>
    </div>
  )
}
