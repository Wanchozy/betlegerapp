import { Bet, PNLSummary } from './types'
import {
  computePNL,
  filterBetsByDateRange,
  getMonthRange,
  getWeekRange,
  getYearRange,
} from './utils'

export interface PeriodSummary {
  key: string
  label: string
  summary: PNLSummary
}

export interface FieldBreakdown {
  label: string
  count: number
  profit: number
}

interface PeriodDefinition {
  key: string
  label: string
  getRange: (date: Date) => { start: Date; end: Date }
}

const PERIODS: PeriodDefinition[] = [
  { key: 'week', label: 'This Week', getRange: getWeekRange },
  { key: 'month', label: 'This Month', getRange: getMonthRange },
  { key: 'year', label: 'This Year', getRange: getYearRange },
  { key: 'all', label: 'All Time', getRange: () => ({ start: new Date(0), end: new Date() }) },
]

/**
 * Builds the "This Week / This Month / This Year / All Time" P&L summaries
 * used by the reports screens on both web and mobile.
 */
export function buildPeriodSummaries(bets: Bet[], now: Date = new Date()): PeriodSummary[] {
  return PERIODS.map((period) => {
    const { start, end } = period.getRange(now)
    return {
      key: period.key,
      label: period.label,
      summary: computePNL(filterBetsByDateRange(bets, start, end)),
    }
  })
}

/**
 * Aggregates total count/profit per distinct value of `field` (e.g. per
 * sport or bet type), sorted by profit descending.
 */
export function aggregateByField(bets: Bet[], field: 'sport' | 'bet_type'): FieldBreakdown[] {
  const map = new Map<string, { count: number; profit: number }>()

  for (const bet of bets) {
    const key = bet[field]
    const entry = map.get(key) ?? { count: 0, profit: 0 }
    entry.count += 1
    entry.profit += bet.profit_loss
    map.set(key, entry)
  }

  return Array.from(map.entries())
    .map(([label, stats]) => ({ label, ...stats }))
    .sort((a, b) => b.profit - a.profit)
}
