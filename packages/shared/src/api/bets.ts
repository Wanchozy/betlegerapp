import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabase } from '../supabase'
import { deriveProfitLoss } from '../utils'
import type { Bet, BetFormData } from '../types'

export interface BetsRepository {
  fetchBets(userId: string): Promise<Bet[]>
  createBet(userId: string, form: BetFormData): Promise<Bet>
  updateBet(id: string, form: Partial<BetFormData>): Promise<Bet>
  deleteBet(id: string): Promise<void>
}

/**
 * Creates a bets data-access layer backed by Supabase.
 *
 * Accepting an optional `client` (instead of always reaching for the global
 * singleton) is what makes this testable: unit tests can pass in a fake
 * client instead of hitting the network, and any future package (admin
 * tools, scripts, etc.) can reuse this without duplicating query logic.
 */
export function createBetsRepository(client?: SupabaseClient): BetsRepository {
  const db = () => client ?? getSupabase()

  return {
    async fetchBets(userId) {
      const { data, error } = await db()
        .from('bets')
        .select('*')
        .eq('user_id', userId)
        .order('placed_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },

    async createBet(userId, form) {
      const { data, error } = await db()
        .from('bets')
        .insert({
          ...form,
          user_id: userId,
          profit_loss: deriveProfitLoss(form.outcome, form.odds, form.stake),
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    async updateBet(id, form) {
      const patch: Record<string, unknown> = { ...form }

      if (form.outcome !== undefined && form.odds !== undefined && form.stake !== undefined) {
        patch.profit_loss = deriveProfitLoss(form.outcome, form.odds, form.stake)
      }

      const { data, error } = await db().from('bets').update(patch).eq('id', id).select().single()

      if (error) throw error
      return data
    },

    async deleteBet(id) {
      const { error } = await db().from('bets').delete().eq('id', id)
      if (error) throw error
    },
  }
}
