import { deriveProfitLoss } from '../utils'
import type { Bet } from '../types'
import type { BetsRepository } from './bets'

let mockIdCounter = 0

function nextId(): string {
  mockIdCounter += 1
  return `mock-${mockIdCounter}-${Date.now()}`
}

function sortByPlacedAtDesc(bets: Bet[]): Bet[] {
  return [...bets].sort((a, b) => new Date(b.placed_at).getTime() - new Date(a.placed_at).getTime())
}

/**
 * In-memory implementation of `BetsRepository`, used for local development
 * and demos when no Supabase project is configured yet (see
 * `hasSupabaseConfig`), and reused directly in tests. It implements the
 * exact same interface as the Supabase-backed repository, so callers
 * (web/mobile pages) don't need any special-casing for demo mode.
 *
 * State only lives for the lifetime of the process/tab - refreshing the
 * page resets it back to the seed data.
 */
export function createMockBetsRepository(seedBets: Bet[] = []): BetsRepository {
  let bets: Bet[] = seedBets.map((bet) => ({ ...bet }))

  return {
    async fetchBets(userId) {
      return sortByPlacedAtDesc(bets.filter((bet) => bet.user_id === userId))
    },

    async createBet(userId, form) {
      const now = new Date().toISOString()
      const bet: Bet = {
        id: nextId(),
        user_id: userId,
        sport: form.sport,
        event: form.event,
        bet_type: form.bet_type,
        odds: form.odds,
        stake: form.stake,
        outcome: form.outcome,
        profit_loss: deriveProfitLoss(form.outcome, form.odds, form.stake),
        placed_at: form.placed_at,
        settled_at: form.settled_at ?? null,
        notes: form.notes ?? null,
        created_at: now,
      }
      bets = [...bets, bet]
      return bet
    },

    async updateBet(id, form) {
      const index = bets.findIndex((bet) => bet.id === id)
      if (index === -1) throw new Error(`Bet not found: ${id}`)

      const merged: Bet = { ...bets[index], ...form }

      if (form.outcome !== undefined || form.odds !== undefined || form.stake !== undefined) {
        merged.profit_loss = deriveProfitLoss(merged.outcome, merged.odds, merged.stake)
      }

      bets = bets.map((bet, i) => (i === index ? merged : bet))
      return merged
    },

    async deleteBet(id) {
      bets = bets.filter((bet) => bet.id !== id)
    },
  }
}
