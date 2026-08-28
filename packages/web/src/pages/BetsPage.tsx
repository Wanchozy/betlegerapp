import { useEffect, useState } from 'react'
import { Bet, BetFormData } from '@betledger/shared'
import { BetForm } from '../components/BetForm'
import { BetList } from '../components/BetList'
import { fetchBets, createBet, deleteBet } from '../api/bets'

const DEMO_USER_ID = 'demo-user'

export function BetsPage() {
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

  async function handleCreate(form: BetFormData) {
    try {
      const bet = await createBet(DEMO_USER_ID, form)
      setBets((prev) => [bet, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bet')
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
    <div className="space-y-6">
      <BetForm onSubmit={handleCreate} />

      {error && (
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : (
        <BetList bets={bets} onDelete={handleDelete} />
      )}
    </div>
  )
}
