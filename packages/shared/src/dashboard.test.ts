import { describe, expect, it } from 'vitest'
import { buildDashboardData } from './dashboard'
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
    outcome: 'win',
    profit_loss: 90,
    placed_at: '2024-01-15T00:00:00.000Z',
    settled_at: null,
    notes: null,
    created_at: '2024-01-15T00:00:00.000Z',
    ...overrides,
  }
}

describe('buildDashboardData', () => {
  const now = new Date('2024-01-17T12:00:00.000Z') // Wednesday, week of Jan 15-21

  it('buckets bets into week/month/year/all-time', () => {
    const bets = [
      makeBet({ id: 'this-week', placed_at: '2024-01-16T00:00:00.000Z', profit_loss: 10 }),
      makeBet({ id: 'this-month', placed_at: '2024-01-02T00:00:00.000Z', profit_loss: 20 }),
      makeBet({ id: 'last-year', placed_at: '2023-06-01T00:00:00.000Z', profit_loss: 30 }),
    ]

    const dashboard = buildDashboardData(bets, now)

    expect(dashboard.week.total_profit_loss).toBe(10)
    expect(dashboard.month.total_profit_loss).toBe(30)
    expect(dashboard.year.total_profit_loss).toBe(30)
    expect(dashboard.all_time.total_profit_loss).toBe(60)
  })

  it('caps recent_bets at 10, preserving input order', () => {
    const bets = Array.from({ length: 15 }, (_, i) => makeBet({ id: `bet-${i}` }))
    const dashboard = buildDashboardData(bets, now)
    expect(dashboard.recent_bets).toHaveLength(10)
    expect(dashboard.recent_bets[0].id).toBe('bet-0')
  })
})
