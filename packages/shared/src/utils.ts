import { Bet, BetOutcome, PNLSummary } from './types'

/**
 * Profit for a *winning* bet, given American odds.
 */
export function calculateProfitLoss(odds: number, stake: number): number {
  if (odds > 0) {
    return stake * (odds / 100)
  }
  return stake * (100 / Math.abs(odds))
}

/**
 * Derives the profit/loss for a bet based on its outcome. This is the single
 * place that decides how `profit_loss` is computed, so it can be unit tested
 * and reused by every data-access layer (web, mobile, future admin tools)
 * instead of being recalculated ad-hoc in each package.
 */
export function deriveProfitLoss(outcome: BetOutcome, odds: number, stake: number): number {
  if (outcome === 'win') return calculateProfitLoss(odds, stake)
  if (outcome === 'loss') return -stake
  return 0
}

export function computePNL(bets: Bet[]): PNLSummary {
  const settled = bets.filter((b) => b.outcome !== 'pending')

  const total_stake = settled.reduce((sum, b) => sum + b.stake, 0)
  const total_profit_loss = settled.reduce((sum, b) => sum + b.profit_loss, 0)

  const wins = settled.filter((b) => b.outcome === 'win').length
  const losses = settled.filter((b) => b.outcome === 'loss').length
  const pushes = settled.filter((b) => b.outcome === 'push').length

  const total_bets = settled.length
  const win_rate = total_bets > 0 ? wins / total_bets : 0
  const roi = total_stake > 0 ? total_profit_loss / total_stake : 0

  return {
    total_bets,
    wins,
    losses,
    pushes,
    total_stake,
    total_profit_loss,
    win_rate,
    roi,
  }
}

export function filterBetsByDateRange(
  bets: Bet[],
  start: Date,
  end: Date
): Bet[] {
  return bets.filter((b) => {
    const date = new Date(b.placed_at)
    return date >= start && date <= end
  })
}

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(date)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function getMonthRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

export function getYearRange(date: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), 0, 1)
  const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999)
  return { start, end }
}
