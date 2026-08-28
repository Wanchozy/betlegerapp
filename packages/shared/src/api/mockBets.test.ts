import { beforeEach, describe, expect, it } from 'vitest'
import { createMockBetsRepository } from './mockBets'
import type { Bet, BetFormData } from '../types'

function makeBet(overrides: Partial<Bet> = {}): Bet {
  return {
    id: overrides.id ?? 'seed-1',
    user_id: 'user-1',
    sport: 'NFL',
    event: 'Chiefs vs Eagles',
    bet_type: 'moneyline',
    odds: -110,
    stake: 100,
    outcome: 'win',
    profit_loss: 91,
    placed_at: '2024-01-10T00:00:00.000Z',
    settled_at: '2024-01-10T00:00:00.000Z',
    notes: null,
    created_at: '2024-01-10T00:00:00.000Z',
    ...overrides,
  }
}

const sampleForm: BetFormData = {
  sport: 'NBA',
  event: 'Lakers vs Celtics',
  bet_type: 'spread',
  odds: 120,
  stake: 50,
  outcome: 'loss',
  placed_at: '2024-02-01T00:00:00.000Z',
}

describe('createMockBetsRepository', () => {
  describe('fetchBets', () => {
    it('only returns bets for the given user, newest first', async () => {
      const repo = createMockBetsRepository([
        makeBet({ id: '1', user_id: 'user-1', placed_at: '2024-01-01T00:00:00.000Z' }),
        makeBet({ id: '2', user_id: 'user-2', placed_at: '2024-01-20T00:00:00.000Z' }),
        makeBet({ id: '3', user_id: 'user-1', placed_at: '2024-01-15T00:00:00.000Z' }),
      ])

      const result = await repo.fetchBets('user-1')

      expect(result.map((b) => b.id)).toEqual(['3', '1'])
    })

    it('does not mutate the seed data passed in', async () => {
      const seed = [makeBet({ id: '1' })]
      const repo = createMockBetsRepository(seed)
      await repo.createBet('user-1', sampleForm)
      expect(seed).toHaveLength(1)
    })
  })

  describe('createBet', () => {
    let repo: ReturnType<typeof createMockBetsRepository>

    beforeEach(() => {
      repo = createMockBetsRepository([])
    })

    it('assigns a unique id and derives profit_loss from the outcome', async () => {
      const bet = await repo.createBet('user-1', sampleForm)

      expect(bet.id).toBeTruthy()
      expect(bet.user_id).toBe('user-1')
      expect(bet.profit_loss).toBe(-50) // loss => -stake

      const all = await repo.fetchBets('user-1')
      expect(all).toHaveLength(1)
    })

    it('generates distinct ids for successive bets', async () => {
      const first = await repo.createBet('user-1', sampleForm)
      const second = await repo.createBet('user-1', sampleForm)
      expect(first.id).not.toBe(second.id)
    })
  })

  describe('updateBet', () => {
    it('merges the patch and recomputes profit_loss when outcome/odds/stake change', async () => {
      const repo = createMockBetsRepository([makeBet({ id: 'bet-1', outcome: 'pending', profit_loss: 0 })])

      const updated = await repo.updateBet('bet-1', { outcome: 'win', odds: -110, stake: 100 })

      expect(updated.profit_loss).toBeCloseTo(90.9, 1)
      expect(updated.outcome).toBe('win')
    })

    it('leaves profit_loss untouched for unrelated fields', async () => {
      const repo = createMockBetsRepository([makeBet({ id: 'bet-1', profit_loss: 42 })])
      const updated = await repo.updateBet('bet-1', { notes: 'hello' })
      expect(updated.profit_loss).toBe(42)
      expect(updated.notes).toBe('hello')
    })

    it('throws for an unknown id', async () => {
      const repo = createMockBetsRepository([])
      await expect(repo.updateBet('missing', { notes: 'x' })).rejects.toThrow('Bet not found')
    })
  })

  describe('deleteBet', () => {
    it('removes the bet with the given id', async () => {
      const repo = createMockBetsRepository([makeBet({ id: 'bet-1' }), makeBet({ id: 'bet-2' })])
      await repo.deleteBet('bet-1')
      const remaining = await repo.fetchBets('user-1')
      expect(remaining.map((b) => b.id)).toEqual(['bet-2'])
    })
  })
})
