import { useEffect, useState } from 'react'
import { DashboardData, Bet, computePNL, filterBetsByDateRange, getWeekRange, getMonthRange, getYearRange } from '@betledger/shared'
import { Dashboard } from '../components/Dashboard'
import { fetchBets, deleteBet } from '../api/bets'

const DEMO_USER_ID = 'demo-user'

function buildDashboard(bets: Bet[]): DashboardData {
  const now = new Date()
  const weekRange = getWeekRange(now)
  const monthRange = getMonthRange(now)
  const yearRange = getYearRange(now)

  return {
    week: computePNL(filterBetsByDateRange(bets, weekRange.start, weekRange.end)),
    month: computePNL(filterBetsByDateRange(bets, monthRange.start, monthRange.end)),
    year: computePNL(filterBetsByDateRange(bets, yearRange.start, yearRange.end)),
    all_time: computePNL(bets),
    recent_bets: bets.slice(0, 10),
  }
}

export function DashboardPage() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBets()
  }, [])

  async function loadBets() {
    try {
      setLoading(true)
      const data = await fetchBets(DEMO_USER_ID)
      setBets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bets')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteBet(id)
      setBets((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bet')
    }
  }

  if (loading) {
    return <p className="text-center text-gray-400">Loading...</p>
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
        {error}
      </div>
    )
  }

  return <Dashboard data={buildDashboard(bets)} onDeleteBet={handleDelete} />
}
