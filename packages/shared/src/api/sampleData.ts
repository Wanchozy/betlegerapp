import { DEMO_USER_ID } from '../auth'
import { deriveProfitLoss } from '../utils'
import type { Bet, BetOutcome, BetType, Sport } from '../types'

function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

interface SampleBetInput {
  id: string
  sport: Sport
  event: string
  bet_type: BetType
  odds: number
  stake: number
  outcome: BetOutcome
  placedDaysAgo: number
  notes?: string
}

function buildSampleBet(input: SampleBetInput): Bet {
  const placed_at = daysAgo(input.placedDaysAgo)
  return {
    id: input.id,
    user_id: DEMO_USER_ID,
    sport: input.sport,
    event: input.event,
    bet_type: input.bet_type,
    odds: input.odds,
    stake: input.stake,
    outcome: input.outcome,
    profit_loss: deriveProfitLoss(input.outcome, input.odds, input.stake),
    placed_at,
    settled_at: input.outcome === 'pending' ? null : placed_at,
    notes: input.notes ?? null,
    created_at: placed_at,
  }
}

/**
 * Sample bets used by the demo/mock repository so the app has realistic
 * data to display when no Supabase project is configured yet. Spans
 * this week, this month, last month, and last year so every dashboard
 * and report bucket has something to show.
 */
export const sampleBets: Bet[] = [
  buildSampleBet({
    id: 'demo-1',
    sport: 'NFL',
    event: 'Chiefs vs Eagles',
    bet_type: 'moneyline',
    odds: -150,
    stake: 100,
    outcome: 'win',
    placedDaysAgo: 1,
  }),
  buildSampleBet({
    id: 'demo-2',
    sport: 'NBA',
    event: 'Lakers vs Celtics',
    bet_type: 'spread',
    odds: 120,
    stake: 50,
    outcome: 'loss',
    placedDaysAgo: 2,
  }),
  buildSampleBet({
    id: 'demo-3',
    sport: 'NHL',
    event: 'Rangers vs Bruins',
    bet_type: 'over_under',
    odds: -110,
    stake: 75,
    outcome: 'win',
    placedDaysAgo: 3,
  }),
  buildSampleBet({
    id: 'demo-4',
    sport: 'Soccer',
    event: 'Man City vs Arsenal',
    bet_type: 'moneyline',
    odds: 175,
    stake: 40,
    outcome: 'pending',
    placedDaysAgo: 0,
  }),
  buildSampleBet({
    id: 'demo-5',
    sport: 'MLB',
    event: 'Yankees vs Red Sox',
    bet_type: 'moneyline',
    odds: -130,
    stake: 60,
    outcome: 'win',
    placedDaysAgo: 9,
  }),
  buildSampleBet({
    id: 'demo-6',
    sport: 'NBA',
    event: 'Warriors vs Suns',
    bet_type: 'prop',
    odds: 200,
    stake: 25,
    outcome: 'loss',
    placedDaysAgo: 12,
  }),
  buildSampleBet({
    id: 'demo-7',
    sport: 'NFL',
    event: 'Cowboys vs Giants',
    bet_type: 'spread',
    odds: -105,
    stake: 90,
    outcome: 'push',
    placedDaysAgo: 18,
  }),
  buildSampleBet({
    id: 'demo-8',
    sport: 'UFC',
    event: 'Jones vs Aspinall',
    bet_type: 'moneyline',
    odds: -200,
    stake: 100,
    outcome: 'win',
    placedDaysAgo: 25,
  }),
  buildSampleBet({
    id: 'demo-9',
    sport: 'NCAAF',
    event: 'Alabama vs Georgia',
    bet_type: 'over_under',
    odds: 110,
    stake: 45,
    outcome: 'loss',
    placedDaysAgo: 40,
  }),
  buildSampleBet({
    id: 'demo-10',
    sport: 'Tennis',
    event: 'Djokovic vs Alcaraz',
    bet_type: 'moneyline',
    odds: 140,
    stake: 30,
    outcome: 'win',
    placedDaysAgo: 200,
  }),
  buildSampleBet({
    id: 'demo-11',
    sport: 'Boxing',
    event: 'Fury vs Usyk',
    bet_type: 'futures',
    odds: 300,
    stake: 20,
    outcome: 'loss',
    placedDaysAgo: 250,
  }),
]
