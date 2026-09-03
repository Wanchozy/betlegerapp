import { useEffect, useState } from 'react'
import { Bet, aggregateByField, buildPeriodSummaries, getCurrentUserId } from '@betledger/shared'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { PNLSummary as PNLSummaryCard } from '../components/PNLSummary'
import { BreakdownCard } from '../components/BreakdownCard'
import { PageHeader } from '../components/PageHeader'
import { LoadingState } from '../components/LoadingState'
import { ErrorBanner } from '../components/ErrorBanner'
import { fetchBets } from '../api/bets'

const userId = getCurrentUserId()

export function ReportsPage() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBets(userId)
      .then(setBets)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load bets'))
      .finally(() => setLoading(false))
  }, [])

  const summaries = buildPeriodSummaries(bets)

  const chartData = summaries.map((s) => ({
    period: s.label,
    'P&L': Number(s.summary.total_profit_loss.toFixed(2)),
    Stake: Number(s.summary.total_stake.toFixed(2)),
  }))

  const bySport = aggregateByField(bets, 'sport')
  const byType = aggregateByField(bets, 'bet_type')

  return (
    <div>
      <PageHeader title="Reports" subtitle="Analyze your betting performance over time" />

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {loading ? (
        <LoadingState label="Crunching the numbers..." />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {summaries.map((s, index) => (
              <PNLSummaryCard key={s.key} summary={s.summary} title={s.label} index={index} />
            ))}
          </div>

          <div className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-medium text-gray-500">P&L by Period</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e9e3d6" vertical={false} />
                <XAxis dataKey="period" stroke="#9ca3af" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="#9ca3af" tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  cursor={{ fill: '#faf7f1' }}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e9e3d6',
                    borderRadius: 12,
                    fontSize: 13,
                  }}
                  labelStyle={{ color: '#16241c', fontWeight: 600 }}
                />
                <Bar dataKey="P&L" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BreakdownCard title="By Sport" data={bySport} index={0} />
            <BreakdownCard title="By Bet Type" data={byType} index={1} />
          </div>
        </div>
      )}
    </div>
  )
}
