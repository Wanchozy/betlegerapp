import { useEffect, useState } from 'react'
import { Bet, buildDashboardData, getCurrentUserId } from '@betledger/shared'
import { Dashboard } from '../components/Dashboard'
import { PageHeader } from '../components/PageHeader'
import { LoadingState } from '../components/LoadingState'
import { ErrorBanner } from '../components/ErrorBanner'
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

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Your betting performance at a glance" />

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {loading ? (
        <LoadingState label="Loading your bets..." />
      ) : (
        <Dashboard data={buildDashboardData(bets)} onDeleteBet={handleDelete} />
      )}
    </div>
  )
}
