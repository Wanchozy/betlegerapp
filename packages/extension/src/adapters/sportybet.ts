import type { BetFormData, BetType, Sport } from '@betledger/shared'
import type { CapturedRequest } from '../messaging'
import type { BetSiteAdapter, ParsedBet } from './types'

/**
 * Adapter for SportyBet.
 *
 * SportyBet's actual "place bet" call (`/api/tz/orders/order`) sends and
 * receives an encrypted payload, so it can't be read directly. Instead, this
 * adapter reads the `cashAbleBet` / `cashAbleBets` endpoints, which power
 * SportyBet's own "Open Bets" / cash-out UI and return full bet details as
 * plain JSON (stake, odds, selections, etc).
 *
 * Because that endpoint only ever returns *unsettled* bets (that's what
 * "cashable" means), every bet captured this way is recorded as `pending` -
 * there's no capture point yet for when a bet later settles as a win/loss
 * (that would need whatever endpoint powers the settled "Bet History" tab,
 * which hasn't been captured yet). Practically, this means a bet shows up in
 * BetLedger once you view "My Bets"/"Open Bets" after placing it, not
 * necessarily the instant you click "place bet".
 *
 * Known limitation: stake is stored as a raw number with no currency
 * conversion, so if your SportyBet account isn't already in USD, the number
 * will be technically correct but the wrong currency.
 */

const SPORT_ID_MAP: Record<string, Sport> = {
  'sr:sport:1': 'Soccer',
  'sr:sport:5': 'Tennis',
  // TODO: add more Sportradar sport ids as they're captured (basketball,
  // American football, etc.) - anything unmapped falls back to 'Other'.
}

function mapSport(sportId: string | undefined): Sport {
  if (!sportId) return 'Other'
  return SPORT_ID_MAP[sportId] ?? 'Other'
}

function mapBetType(
  orderType: string | undefined,
  combinationNum: number | undefined,
  marketDesc: string | undefined
): BetType {
  if ((combinationNum ?? 1) > 1 || (orderType && orderType !== 'Singles')) return 'parlay'

  const desc = marketDesc?.toLowerCase() ?? ''
  if (desc.includes('1x2') || desc.includes('winner')) return 'moneyline'
  if (desc.includes('handicap')) return 'spread'
  if (desc.includes('over/under') || desc.includes('total')) return 'over_under'
  return 'other'
}

/**
 * SportyBet (like most non-US sportsbooks) uses decimal odds (e.g. 3.46),
 * but @betledger/shared's profit/loss math expects American odds (e.g.
 * +246). The two are mathematically equivalent for profit purposes, so this
 * just converts formats.
 */
function decimalToAmericanOdds(decimalOdds: number): number {
  if (decimalOdds >= 2) return Math.round((decimalOdds - 1) * 100)
  return Math.round(-100 / (decimalOdds - 1))
}

interface SportyBetSelection {
  home?: string
  away?: string
  marketDesc?: string
  outcomeDesc?: string
  sportId?: string
  tournamentName?: string
}

interface SportyBetBetDetail {
  id: string
  orderType?: string
  combinationNum?: number
  totalOdds: string
  stake: string
  createTime: number
  selections?: SportyBetSelection[]
  selectionDescs?: SportyBetSelection[]
}

function describeEvent(selections: SportyBetSelection[]): string {
  if (selections.length === 0) return 'SportyBet bet'
  if (selections.length === 1) {
    const [s] = selections
    return s.home && s.away ? `${s.home} v ${s.away}` : s.tournamentName ?? 'SportyBet bet'
  }
  return `${selections.length}-leg parlay`
}

function toParsedBet(bet: SportyBetBetDetail): ParsedBet | null {
  const selections = bet.selections ?? bet.selectionDescs ?? []
  const [first] = selections
  const totalOdds = parseFloat(bet.totalOdds)
  const stake = parseFloat(bet.stake)

  if (!bet.id || Number.isNaN(totalOdds) || Number.isNaN(stake)) return null

  const formData: BetFormData = {
    sport: mapSport(first?.sportId),
    event: describeEvent(selections),
    bet_type: mapBetType(bet.orderType, bet.combinationNum, first?.marketDesc),
    odds: decimalToAmericanOdds(totalOdds),
    stake,
    outcome: 'pending', // this endpoint only ever returns unsettled bets
    placed_at: new Date(bet.createTime).toISOString(),
    notes: `Captured from SportyBet (bet ${bet.id})`,
  }

  return { externalId: bet.id, formData }
}

export const sportybetAdapter: BetSiteAdapter = {
  id: 'sportybet',
  label: 'SportyBet',

  matches(capture) {
    return capture.pageOrigin.includes('sportybet.com')
  },

  parseBetPlacements(capture: CapturedRequest): ParsedBet[] {
    // Matches ".../cashAbleBet?..." (single) and ".../cashAbleBets?..."
    // (list), but not ".../cashAbleBets/count" (no bet details in that one).
    if (!/\/realSportsGame\/cashAbleBets?(\?|$)/.test(capture.url)) return []
    if (!capture.responseBody) return []

    try {
      const parsed = JSON.parse(capture.responseBody)
      if (parsed.bizCode !== 10000 || !parsed.data) return []

      const bets: SportyBetBetDetail[] = parsed.data.id ? [parsed.data] : parsed.data.cashAbleBets ?? []

      return bets.map(toParsedBet).filter((bet): bet is ParsedBet => bet !== null)
    } catch {
      return []
    }
  },
}
