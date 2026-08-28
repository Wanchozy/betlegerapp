import { PNLSummary as PNLType } from '@betledger/shared'
import { TrendingUp, TrendingDown, Target, DollarSign, Activity } from 'lucide-react'

interface Props {
  summary: PNLType
  title: string
}

export function PNLSummary({ summary, title }: Props) {
  const isPositive = summary.total_profit_loss >= 0

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <h3 className="mb-3 text-sm font-medium text-gray-400">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <DollarSign size={18} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Total Stake</p>
            <p className="font-semibold">${summary.total_stake.toFixed(2)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp size={18} className="text-green-400" />
          ) : (
            <TrendingDown size={18} className="text-red-400" />
          )}
          <div>
            <p className="text-xs text-gray-500">P&L</p>
            <p className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}${summary.total_profit_loss.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Target size={18} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">Win Rate</p>
            <p className="font-semibold">{(summary.win_rate * 100).toFixed(1)}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-gray-500" />
          <div>
            <p className="text-xs text-gray-500">ROI</p>
            <p className={`font-semibold ${summary.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {(summary.roi * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-3 text-xs text-gray-500">
        <span>{summary.wins}W</span>
        <span>{summary.losses}L</span>
        <span>{summary.pushes}P</span>
        <span>{summary.total_bets} total</span>
      </div>
    </div>
  )
}
