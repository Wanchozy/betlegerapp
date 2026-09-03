import type { DashboardData } from '@betledger/shared'
import { PNLSummary } from './PNLSummary'
import { BetList } from './BetList'

interface Props {
  data: DashboardData
  onDeleteBet: (id: string) => void
}

export function Dashboard({ data, onDeleteBet }: Props) {
  const periods = [
    { title: 'This Week', summary: data.week },
    { title: 'This Month', summary: data.month },
    { title: 'This Year', summary: data.year },
    { title: 'All Time', summary: data.all_time },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {periods.map((period, index) => (
          <PNLSummary key={period.title} summary={period.summary} title={period.title} index={index} />
        ))}
      </div>

      <div>
        <h2 className="mb-3 font-serif text-xl font-semibold text-ink">Recent Bets</h2>
        <BetList bets={data.recent_bets} onDelete={onDeleteBet} />
      </div>
    </div>
  )
}
