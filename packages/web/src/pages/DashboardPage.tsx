import { useEffect, useState } from 'react'
import { Bet, buildDashboardData, getCurrentUserId } from '@betledger/shared'
import { Dashboard } from '../components/Dashboard'
import { fetchBets, deleteBet } from '../api/bets'

const userId = getCurrentUserId()

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
      const data = await fetchBets(userId)
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

  return <Dashboard data={buildDashboardData(bets)} onDeleteBet={handleDelete} />
}
