import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createBetsRepository } from './bets'
import type { BetFormData } from '../types'

/**
 * Builds a minimal fake Supabase client that mimics the chainable,
 * thenable query builder used by @supabase/supabase-js, without ever
 * touching the network. This is what makes the repository unit-testable:
 * `createBetsRepository` accepts any object with a `.from()` method.
 */
function createFakeClient(result: { data?: unknown; error?: unknown } = { data: null, error: null }) {
  const builder: any = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    then: (onFulfilled: (value: typeof result) => unknown) => Promise.resolve(result).then(onFulfilled),
  }
  const from = vi.fn(() => builder)
  return { from, builder } as unknown as SupabaseClient & { from: typeof from; builder: typeof builder }
}

const sampleForm: BetFormData = {
  sport: 'NFL',
  event: 'Chiefs vs Eagles',
  bet_type: 'moneyline',
  odds: 150,
  stake: 100,
  outcome: 'win',
  placed_at: '2024-01-15T00:00:00.000Z',
}

describe('createBetsRepository', () => {
  describe('fetchBets', () => {
    it('queries bets for the given user, newest first', async () => {
      const bets = [{ id: '1' }]
      const client = createFakeClient({ data: bets, error: null })
      const repo = createBetsRepository(client)

      const result = await repo.fetchBets('user-1')

      expect(client.from).toHaveBeenCalledWith('bets')
      expect(client.builder.eq).toHaveBeenCalledWith('user_id', 'user-1')
      expect(client.builder.order).toHaveBeenCalledWith('placed_at', { ascending: false })
      expect(result).toBe(bets)
    })

    it('returns an empty array when data is null', async () => {
      const client = createFakeClient({ data: null, error: null })
      const repo = createBetsRepository(client)
      expect(await repo.fetchBets('user-1')).toEqual([])
    })

    it('throws when the query errors', async () => {
      const client = createFakeClient({ data: null, error: new Error('boom') })
      const repo = createBetsRepository(client)
      await expect(repo.fetchBets('user-1')).rejects.toThrow('boom')
    })
  })

  describe('createBet', () => {
    it('derives profit_loss from the outcome instead of trusting the caller', async () => {
      const client = createFakeClient({ data: { id: 'new-bet' }, error: null })
      const repo = createBetsRepository(client)

      await repo.createBet('user-1', sampleForm)

      expect(client.builder.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          outcome: 'win',
          profit_loss: 150, // calculateProfitLoss(150, 100)
        })
      )
    })

    it('records a negative profit_loss for a loss', async () => {
      const client = createFakeClient({ data: { id: 'new-bet' }, error: null })
      const repo = createBetsRepository(client)

      await repo.createBet('user-1', { ...sampleForm, outcome: 'loss' })

      expect(client.builder.insert).toHaveBeenCalledWith(
        expect.objectContaining({ profit_loss: -100 })
      )
    })

    it('throws when the insert errors', async () => {
      const client = createFakeClient({ data: null, error: new Error('insert failed') })
      const repo = createBetsRepository(client)
      await expect(repo.createBet('user-1', sampleForm)).rejects.toThrow('insert failed')
    })
  })

  describe('updateBet', () => {
    it('recomputes profit_loss when outcome/odds/stake are all provided', async () => {
      const client = createFakeClient({ data: { id: 'bet-1' }, error: null })
      const repo = createBetsRepository(client)

      await repo.updateBet('bet-1', { outcome: 'win', odds: 150, stake: 100 })

      expect(client.builder.update).toHaveBeenCalledWith(
        expect.objectContaining({ profit_loss: 150 })
      )
    })

    it('leaves profit_loss untouched for a partial patch', async () => {
      const client = createFakeClient({ data: { id: 'bet-1' }, error: null })
      const repo = createBetsRepository(client)

      await repo.updateBet('bet-1', { notes: 'updated notes' })

      expect(client.builder.update).toHaveBeenCalledWith({ notes: 'updated notes' })
    })
  })

  describe('deleteBet', () => {
    it('deletes by id', async () => {
      const client = createFakeClient({ data: null, error: null })
      const repo = createBetsRepository(client)

      await repo.deleteBet('bet-1')

      expect(client.builder.delete).toHaveBeenCalled()
      expect(client.builder.eq).toHaveBeenCalledWith('id', 'bet-1')
    })

    it('throws when the delete errors', async () => {
      const client = createFakeClient({ data: null, error: new Error('delete failed') })
      const repo = createBetsRepository(client)
      await expect(repo.deleteBet('bet-1')).rejects.toThrow('delete failed')
    })
  })
})
