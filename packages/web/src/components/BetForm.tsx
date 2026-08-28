import { useState } from 'react'
import { BetFormData, Sport, BetType, BetOutcome } from '@betledger/shared'

const sports: Sport[] = [
  'NFL', 'NBA', 'MLB', 'NHL', 'NCAAF', 'NCAAB', 'UFC', 'Boxing', 'Soccer', 'Tennis', 'Other',
]

const betTypes: BetType[] = [
  'moneyline', 'spread', 'over_under', 'parlay', 'prop', 'futures', 'other',
]

const outcomes: BetOutcome[] = ['pending', 'win', 'loss', 'push']

interface Props {
  onSubmit: (data: BetFormData) => Promise<void>
  initial?: Partial<BetFormData>
}

export function BetForm({ onSubmit, initial }: Props) {
  const [form, setForm] = useState<BetFormData>({
    sport: initial?.sport ?? 'NFL',
    event: initial?.event ?? '',
    bet_type: initial?.bet_type ?? 'moneyline',
    odds: initial?.odds ?? 0,
    stake: initial?.stake ?? 0,
    outcome: initial?.outcome ?? 'pending',
    placed_at: initial?.placed_at ?? new Date().toISOString().slice(0, 16),
    notes: initial?.notes ?? '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(form)
      if (!initial) {
        setForm({
          sport: 'NFL',
          event: '',
          bet_type: 'moneyline',
          odds: 0,
          stake: 0,
          outcome: 'pending',
          placed_at: new Date().toISOString().slice(0, 16),
          notes: '',
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-800 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold">{initial ? 'Edit Bet' : 'New Bet'}</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm text-gray-400">Sport</label>
          <select
            value={form.sport}
            onChange={(e) => setForm({ ...form, sport: e.target.value as Sport })}
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
          >
            {sports.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-400">Bet Type</label>
          <select
            value={form.bet_type}
            onChange={(e) => setForm({ ...form, bet_type: e.target.value as BetType })}
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
          >
            {betTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm text-gray-400">Event</label>
          <input
            value={form.event}
            onChange={(e) => setForm({ ...form, event: e.target.value })}
            placeholder="e.g. Chiefs vs Eagles"
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-400">Odds</label>
          <input
            type="number"
            value={form.odds}
            onChange={(e) => setForm({ ...form, odds: Number(e.target.value) })}
            placeholder="e.g. -110"
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-400">Stake ($)</label>
          <input
            type="number"
            step="0.01"
            value={form.stake}
            onChange={(e) => setForm({ ...form, stake: Number(e.target.value) })}
            placeholder="e.g. 100"
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-400">Outcome</label>
          <select
            value={form.outcome}
            onChange={(e) => setForm({ ...form, outcome: e.target.value as BetOutcome })}
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
          >
            {outcomes.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-400">Date</label>
          <input
            type="datetime-local"
            value={form.placed_at}
            onChange={(e) => setForm({ ...form, placed_at: e.target.value })}
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-sm text-gray-400">Notes</label>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Optional notes..."
            className="w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50"
      >
        {submitting ? 'Saving...' : initial ? 'Update Bet' : 'Add Bet'}
      </button>
    </form>
  )
}
