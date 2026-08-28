import { Bet } from '@betledger/shared'
import { Trash2 } from 'lucide-react'

interface Props {
  bets: Bet[]
  onDelete: (id: string) => void
}

export function BetList({ bets, onDelete }: Props) {
  if (bets.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">No bets yet. Add your first bet above!</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400">
            <th className="py-2 pr-4">Date</th>
            <th className="py-2 pr-4">Sport</th>
            <th className="py-2 pr-4">Event</th>
            <th className="py-2 pr-4">Type</th>
            <th className="py-2 pr-4">Odds</th>
            <th className="py-2 pr-4">Stake</th>
            <th className="py-2 pr-4">Outcome</th>
            <th className="py-2 pr-4">P&L</th>
            <th className="py-2" />
          </tr>
        </thead>
        <tbody>
          {bets.map((bet) => (
            <tr key={bet.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
              <td className="py-2 pr-4">{new Date(bet.placed_at).toLocaleDateString()}</td>
              <td className="py-2 pr-4">{bet.sport}</td>
              <td className="py-2 pr-4">{bet.event}</td>
              <td className="py-2 pr-4">{bet.bet_type}</td>
              <td className="py-2 pr-4">{bet.odds > 0 ? `+${bet.odds}` : bet.odds}</td>
              <td className="py-2 pr-4">${bet.stake.toFixed(2)}</td>
              <td className="py-2 pr-4">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${
                    bet.outcome === 'win'
                      ? 'bg-green-500/10 text-green-400'
                      : bet.outcome === 'loss'
                        ? 'bg-red-500/10 text-red-400'
                        : bet.outcome === 'push'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-gray-500/10 text-gray-400'
                  }`}
                >
                  {bet.outcome}
                </span>
              </td>
              <td className={`py-2 pr-4 font-medium ${bet.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {bet.profit_loss >= 0 ? '+' : ''}${bet.profit_loss.toFixed(2)}
              </td>
              <td className="py-2">
                <button
                  onClick={() => onDelete(bet.id)}
                  className="text-gray-600 transition hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
