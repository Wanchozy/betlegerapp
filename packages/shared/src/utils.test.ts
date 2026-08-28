import { describe, expect, it } from 'vitest'
import {
  calculateProfitLoss,
  computePNL,
  deriveProfitLoss,
  filterBetsByDateRange,
  getMonthRange,
  getWeekRange,
  getYearRange,
} from './utils'
import type { Bet } from './types'

function makeBet(overrides: Partial<Bet> = {}): Bet {
  return {
    id: overrides.id ?? 'bet-1',
    user_id: 'user-1',
    sport: 'NFL',
    event: 'Chiefs vs Eagles',
    bet_type: 'moneyline',
    odds: -110,
    stake: 100,
    outcome: 'pending',
    profit_loss: 0,
    placed_at: '2024-01-15T00:00:00.000Z',
    settled_at: null,
    notes: null,
    created_at: '2024-01-15T00:00:00.000Z',
    ...overrides,
  }
}

describe('calculateProfitLoss', () => {
  it('computes profit for positive (underdog) American odds', () => {
    expect(calculateProfitLoss(150, 100)).toBe(150)
  })

  it('computes profit for negative (favorite) American odds', () => {
    expect(calculateProfitLoss(-110, 110)).toBeCloseTo(100)
  })
})

describe('deriveProfitLoss', () => {
  it('returns the calculated profit for a win', () => {
    expect(deriveProfitLoss('win', 150, 100)).toBe(150)
  })

  it('returns the negative stake for a loss', () => {
    expect(deriveProfitLoss('loss', 150, 100)).toBe(-100)
  })

  it('returns 0 for a push', () => {
    expect(deriveProfitLoss('push', 150, 100)).toBe(0)
  })

  it('returns 0 for a pending bet', () => {
    expect(deriveProfitLoss('pending', 150, 100)).toBe(0)
  })
})

describe('computePNL', () => {
  it('ignores pending bets', () => {
    const bets = [makeBet({ outcome: 'pending', stake: 50, profit_loss: 0 })]
    const summary = computePNL(bets)
    expect(summary.total_bets).toBe(0)
    expect(summary.total_stake).toBe(0)
  })

  it('aggregates wins, losses, and pushes', () => {
    const bets = [
      makeBet({ id: '1', outcome: 'win', stake: 100, profit_loss: 90 }),
      makeBet({ id: '2', outcome: 'loss', stake: 50, profit_loss: -50 }),
      makeBet({ id: '3', outcome: 'push', stake: 25, profit_loss: 0 }),
    ]
    const summary = computePNL(bets)

    expect(summary.total_bets).toBe(3)
    expect(summary.wins).toBe(1)
    expect(summary.losses).toBe(1)
    expect(summary.pushes).toBe(1)
    expect(summary.total_stake).toBe(175)
    expect(summary.total_profit_loss).toBe(40)
    expect(summary.win_rate).toBeCloseTo(1 / 3)
    expect(summary.roi).toBeCloseTo(40 / 175)
  })

  it('returns zeroed rates when there are no settled bets', () => {
    const summary = computePNL([])
    expect(summary.win_rate).toBe(0)
    expect(summary.roi).toBe(0)
  })
})

describe('filterBetsByDateRange', () => {
  it('includes bets placed within the range (inclusive)', () => {
    const bets = [
      makeBet({ id: '1', placed_at: '2024-01-01T00:00:00.000Z' }),
      makeBet({ id: '2', placed_at: '2024-01-15T00:00:00.000Z' }),
      makeBet({ id: '3', placed_at: '2024-02-01T00:00:00.000Z' }),
    ]
    const result = filterBetsByDateRange(
      bets,
      new Date('2024-01-01T00:00:00.000Z'),
      new Date('2024-01-31T23:59:59.999Z')
    )
    expect(result.map((b) => b.id)).toEqual(['1', '2'])
  })
})

describe('getWeekRange', () => {
  it('starts on Monday and ends on Sunday', () => {
    const wednesday = new Date('2024-01-17T12:00:00.000Z')
    const { start, end } = getWeekRange(wednesday)
    expect(start.getDay()).toBe(1)
    expect(end.getDay()).toBe(0)
  })
})

describe('getMonthRange', () => {
  it('spans the first to last day of the month', () => {
    const date = new Date('2024-02-10T00:00:00.000Z')
    const { start, end } = getMonthRange(date)
    expect(start.getDate()).toBe(1)
    expect(end.getMonth()).toBe(1)
    expect(end.getDate()).toBe(29) // 2024 is a leap year
  })
})

describe('getYearRange', () => {
  it('spans Jan 1 to Dec 31', () => {
    const date = new Date('2024-06-01T00:00:00.000Z')
    const { start, end } = getYearRange(date)
    expect(start.getMonth()).toBe(0)
    expect(start.getDate()).toBe(1)
    expect(end.getMonth()).toBe(11)
    expect(end.getDate()).toBe(31)
  })
})
