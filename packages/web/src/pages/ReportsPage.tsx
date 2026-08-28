import { useEffect, useState } from 'react'
import { Bet, computePNL, filterBetsByDateRange, getWeekRange, getMonthRange, getYearRange, PNLSummary } from '@betledger/shared'
import { PNLSummary as PNLSummaryCard } from '../components/PNLSummary'
import { fetchBets } from '../api/bets'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const DEMO_USER_ID = 'demo-user'

const periods = [
  { key: 'week', label: 'This Week', getRange: getWeekRange },
  { key: 'month', label: 'This Month', getRange: getMonthRange },
  { key: 'year', label: 'This Year', getRange: getYearRange },
  { key: 'all', label: 'All Time', getRange: () => ({ start: new Date(0), end: new Date() }) },
]

export function ReportsPage() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBets(DEMO_USER_ID)
      .then(setBets)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const summaries: { label: string; summary: PNLSummary }[] = periods.map((p) => {
    const { start, end } = p.getRange(new Date())
    return {
      label: p.label,
      summary: computePNL(filterBetsByDateRange(bets, start, end)),
    }
  })

  const chartData = summaries.map((s) => ({
    period: s.label,
    'P&L': Number(s.summary.total_profit_loss.toFixed(2)),
    Stake: Number(s.summary.total_stake.toFixed(2)),
  }))

  const bySport = aggregateByField(bets, 'sport')
  const byType = aggregateByField(bets, 'bet_type')

  if (loading) return <p className="text-center text-gray-400">Loading...</p>
  if (error) return <div className="rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">{error}</div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaries.map((s) => (
          <PNLSummaryCard key={s.label} summary={s.summary} title={s.label} />
        ))}
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <h3 className="mb-4 text-sm font-medium text-gray-400">P&L by Period</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="period" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 8 }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Bar dataKey="P&L" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BreakdownCard title="By Sport" data={bySport} />
        <BreakdownCard title="By Bet Type" data={byType} />
      </div>
    </div>
  )
}

function aggregateByField(bets: Bet[], field: 'sport' | 'bet_type') {
  const map = new Map<string, { count: number; profit: number }>()
  for (const b of bets) {
    const key = b[field]
    const entry = map.get(key) ?? { count: 0, profit: 0 }
    entry.count++
    entry.profit += b.profit_loss
    map.set(key, entry)
  }
  return Array.from(map.entries())
    .map(([label, stats]) => ({ label, ...stats }))
    .sort((a, b) => b.profit - a.profit)
}

function BreakdownCard({
  title,
  data,
}: {
  title: string
  data: { label: string; count: number; profit: number }[]
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-400">{title}</h3>
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center justify-between text-sm">
            <span>
              {d.label}{' '}
              <span className="text-gray-500">({d.count})</span>
            </span>
            <span className={d.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
              {d.profit >= 0 ? '+' : ''}${d.profit.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
