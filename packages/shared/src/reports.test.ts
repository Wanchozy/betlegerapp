import { describe, expect, it } from 'vitest'
import { aggregateByField, buildPeriodSummaries } from './reports'
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

describe('buildPeriodSummaries', () => {
  it('returns one summary per period, in a stable order', () => {
    const summaries = buildPeriodSummaries([], new Date('2024-01-17T12:00:00.000Z'))
    expect(summaries.map((s) => s.key)).toEqual(['week', 'month', 'year', 'all'])
  })
})

describe('aggregateByField', () => {
  it('groups and sums profit by sport, sorted descending by profit', () => {
    const bets = [
      makeBet({ id: '1', sport: 'NFL', profit_loss: 10 }),
      makeBet({ id: '2', sport: 'NBA', profit_loss: 50 }),
      makeBet({ id: '3', sport: 'NFL', profit_loss: 20 }),
    ]

    const result = aggregateByField(bets, 'sport')

    expect(result).toEqual([
      { label: 'NBA', count: 1, profit: 50 },
      { label: 'NFL', count: 2, profit: 30 },
    ])
  })

  it('returns an empty array for no bets', () => {
    expect(aggregateByField([], 'bet_type')).toEqual([])
  })
})
