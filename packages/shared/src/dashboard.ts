import { Bet, DashboardData } from './types'
import {
  computePNL,
  filterBetsByDateRange,
  getMonthRange,
  getWeekRange,
  getYearRange,
} from './utils'

/**
 * Builds the week/month/year/all-time P&L breakdown used by the dashboard.
 * Pure function of `bets` (and an optional reference date), so it's the same
 * on web, mobile, and in tests - no platform-specific code needed here.
 */
export function buildDashboardData(bets: Bet[], now: Date = new Date()): DashboardData {
  const week = getWeekRange(now)
  const month = getMonthRange(now)
  const year = getYearRange(now)

  return {
    week: computePNL(filterBetsByDateRange(bets, week.start, week.end)),
    month: computePNL(filterBetsByDateRange(bets, month.start, month.end)),
    year: computePNL(filterBetsByDateRange(bets, year.start, year.end)),
    all_time: computePNL(bets),
    recent_bets: bets.slice(0, 10),
  }
}
