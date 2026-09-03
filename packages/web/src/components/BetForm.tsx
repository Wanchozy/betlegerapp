import { useState } from 'react'
import { BetFormData, Sport, BetType, BetOutcome } from '@betledger/shared'

const sports: Sport[] = [
  'NFL', 'NBA', 'MLB', 'NHL', 'NCAAF', 'NCAAB', 'UFC', 'Boxing', 'Soccer', 'Tennis', 'Other',
]

const betTypes: BetType[] = [
  'moneyline', 'spread', 'over_under', 'parlay', 'prop', 'futures', 'other',
]

const outcomes: BetOutcome[] = ['pending', 'win', 'loss', 'push']

const inputClass =
  'w-full rounded-xl border border-cream-200 bg-cream-50 px-3 py-2 text-sm text-ink outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'

const labelClass = 'mb-1 block text-xs font-medium text-gray-500'

function defaultForm(): BetFormData {
  return {
    sport: 'NFL',
    event: '',
    bet_type: 'moneyline',
    odds: 0,
    stake: 0,
    outcome: 'pending',
    placed_at: new Date().toISOString().slice(0, 16),
    notes: '',
  }
}

interface Props {
  onSubmit: (data: BetFormData) => Promise<void>
  initial?: Partial<BetFormData>
  submitLabel?: string
}

export function BetForm({ onSubmit, initial, submitLabel }: Props) {
  const [form, setForm] = useState<BetFormData>({ ...defaultForm(), ...initial })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(form)
      if (!initial) {
        setForm(defaultForm())
      }
    } catch {
      // The parent surfaces the error; keep the form values so the user
      // doesn't lose what they typed.
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Sport</label>
          <select
            value={form.sport}
            onChange={(e) => setForm({ ...form, sport: e.target.value as Sport })}
            className={inputClass}
          >
            {sports.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Bet Type</label>
          <select
            value={form.bet_type}
            onChange={(e) => setForm({ ...form, bet_type: e.target.value as BetType })}
            className={inputClass}
          >
            {betTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Event</label>
          <input
            value={form.event}
            onChange={(e) => setForm({ ...form, event: e.target.value })}
            placeholder="e.g. Chiefs vs Eagles"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Odds</label>
          <input
            type="number"
            value={form.odds}
            onChange={(e) => setForm({ ...form, odds: Number(e.target.value) })}
            placeholder="e.g. -110"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Stake ($)</label>
          <input
            type="number"
            step="0.01"
            value={form.stake}
            onChange={(e) => setForm({ ...form, stake: Number(e.target.value) })}
            placeholder="e.g. 100"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Outcome</label>
          <select
            value={form.outcome}
            onChange={(e) => setForm({ ...form, outcome: e.target.value as BetOutcome })}
            className={inputClass}
          >
            {outcomes.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Date</label>
          <input
            type="datetime-local"
            value={form.placed_at}
            onChange={(e) => setForm({ ...form, placed_at: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Notes</label>
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Optional notes..."
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50 sm:w-auto"
      >
        {submitting ? 'Saving...' : submitLabel ?? (initial ? 'Update Bet' : 'Add Bet')}
      </button>
    </form>
  )
}
