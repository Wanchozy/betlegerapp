import { motion } from 'framer-motion'
import type { PNLSummary as PNLType } from '@betledger/shared'
import { TrendingUp, TrendingDown, Target, Percent } from 'lucide-react'
import { Money } from './Money'

interface Props {
  summary: PNLType
  title: string
  index?: number
}

export function PNLSummary({ summary, title, index = 0 }: Props) {
  const isPositive = summary.total_profit_loss >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full ${
            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}
        >
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        </span>
      </div>

      <Money
        value={summary.total_profit_loss}
        colorize
        showSign
        className="mt-3 block text-2xl font-semibold"
      />

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Target size={13} />
          <span>{(summary.win_rate * 100).toFixed(1)}% win rate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Percent size={13} />
          <span>{(summary.roi * 100).toFixed(1)}% ROI</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 border-t border-cream-200 pt-3 text-xs text-gray-400">
        <span>{summary.wins}W</span>
        <span>{summary.losses}L</span>
        <span>{summary.pushes}P</span>
        <span className="ml-auto">
          {summary.total_bets} bets &middot; <Money value={summary.total_stake} /> staked
        </span>
      </div>
    </motion.div>
  )
}
