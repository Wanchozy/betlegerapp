import { useEffect, useState } from 'react'
import { Bet, BetFormData, getCurrentUserId } from '@betledger/shared'
import { Plus } from 'lucide-react'
import { BetForm } from '../components/BetForm'
import { BetList } from '../components/BetList'
import { Modal } from '../components/Modal'
import { PageHeader } from '../components/PageHeader'
import { LoadingState } from '../components/LoadingState'
import { ErrorBanner } from '../components/ErrorBanner'
import { fetchBets, createBet, deleteBet } from '../api/bets'

const userId = getCurrentUserId()

export function BetsPage() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

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

  async function handleCreate(form: BetFormData) {
    try {
      const bet = await createBet(userId, form)
      setBets((prev) => [bet, ...prev])
      setIsFormOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create bet')
      throw err
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

  function openForm() {
    setError(null)
    setIsFormOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Bets"
        subtitle="Track every wager you place"
        action={
          <button
            onClick={openForm}
            className="flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            <Plus size={16} />
            New Bet
          </button>
        }
      />

      {error && !isFormOpen && (
        <div className="mb-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {loading ? (
        <LoadingState label="Loading your bets..." />
      ) : (
        <BetList bets={bets} onDelete={handleDelete} />
      )}

      <Modal open={isFormOpen} onClose={() => setIsFormOpen(false)} title="New Bet">
        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} />
          </div>
        )}
        <BetForm onSubmit={handleCreate} />
      </Modal>
    </div>
  )
}
