import { motion } from 'framer-motion'
import type { FieldBreakdown } from '@betledger/shared'
import { Money } from './Money'

interface Props {
  title: string
  data: FieldBreakdown[]
  index?: number
}

export function BreakdownCard({ title, data, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      className="rounded-2xl border border-cream-200 bg-white p-5 shadow-sm"
    >
      <h3 className="mb-3 text-sm font-medium text-gray-500">{title}</h3>

      {data.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">No bets yet</p>
      ) : (
        <div className="space-y-2.5">
          {data.map((d) => (
            <div key={d.label} className="flex items-center justify-between text-sm">
              <span className="text-ink">
                {d.label} <span className="text-gray-400">({d.count})</span>
              </span>
              <Money value={d.profit} colorize showSign className="font-medium" />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
