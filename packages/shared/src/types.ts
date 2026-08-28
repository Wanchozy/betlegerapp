export type Sport = 'NFL' | 'NBA' | 'MLB' | 'NHL' | 'NCAAF' | 'NCAAB' | 'UFC' | 'Boxing' | 'Soccer' | 'Tennis' | 'Other'

export type BetOutcome = 'pending' | 'win' | 'loss' | 'push'

export type BetType = 'moneyline' | 'spread' | 'over_under' | 'parlay' | 'prop' | 'futures' | 'other'

export interface Bet {
  id: string
  user_id: string
  sport: Sport
  event: string
  bet_type: BetType
  odds: number
  stake: number
  outcome: BetOutcome
  profit_loss: number
  placed_at: string
  settled_at: string | null
  notes: string | null
  created_at: string
}

export interface BetFormData {
  sport: Sport
  event: string
  bet_type: BetType
  odds: number
  stake: number
  outcome: BetOutcome
  placed_at: string
  settled_at?: string
  notes?: string
}

export interface PNLSummary {
  total_bets: number
  wins: number
  losses: number
  pushes: number
  total_stake: number
  total_profit_loss: number
  win_rate: number
  roi: number
}

export interface DashboardData {
  week: PNLSummary
  month: PNLSummary
  year: PNLSummary
  all_time: PNLSummary
  recent_bets: Bet[]
}
