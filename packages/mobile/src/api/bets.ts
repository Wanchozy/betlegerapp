import { getSupabase, Bet, BetFormData } from '@betledger/shared'

export async function fetchBets(userId: string): Promise<Bet[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', userId)
    .order('placed_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function createBet(userId: string, form: BetFormData): Promise<Bet> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('bets')
    .insert({ ...form, user_id: userId, profit_loss: 0 })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteBet(id: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('bets').delete().eq('id', id)
  if (error) throw error
}
