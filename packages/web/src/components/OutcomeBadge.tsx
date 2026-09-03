import type { BetOutcome } from '@betledger/shared'

const styles: Record<BetOutcome, string> = {
  win: 'bg-emerald-50 text-emerald-600',
  loss: 'bg-red-50 text-red-500',
  push: 'bg-amber-50 text-amber-600',
  pending: 'bg-gray-100 text-gray-500',
}

export function OutcomeBadge({ outcome }: { outcome: BetOutcome }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[outcome]}`}>
      {outcome}
    </span>
  )
}
