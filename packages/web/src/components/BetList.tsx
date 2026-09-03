import { motion, AnimatePresence } from 'framer-motion'
import type { Bet } from '@betledger/shared'
import { Trash2, Inbox } from 'lucide-react'
import { Money } from './Money'
import { OutcomeBadge } from './OutcomeBadge'
import { EmptyState } from './EmptyState'

interface Props {
  bets: Bet[]
  onDelete: (id: string) => void
}

export function BetList({ bets, onDelete }: Props) {
  if (bets.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No bets yet"
        description="Add your first bet to start tracking your performance."
      />
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {bets.map((bet, index) => (
          <motion.div
            key={bet.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25, delay: index * 0.02 }}
            className="group flex items-center gap-4 rounded-2xl border border-cream-200 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-ink">{bet.event}</p>
                <OutcomeBadge outcome={bet.outcome} />
              </div>
              <p className="mt-0.5 text-xs text-gray-400">
                {bet.sport} &middot; {bet.bet_type.replace('_', ' ')} &middot;{' '}
                {new Date(bet.placed_at).toLocaleDateString()} &middot;{' '}
                {bet.odds > 0 ? `+${bet.odds}` : bet.odds} odds &middot; <Money value={bet.stake} /> stake
              </p>
            </div>

            <Money value={bet.profit_loss} colorize showSign className="text-sm font-semibold" />

            <button
              onClick={() => onDelete(bet.id)}
              aria-label={`Delete bet on ${bet.event}`}
              className="text-gray-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
