import type { BetSiteAdapter } from './types'
import type { CapturedRequest } from '../messaging'
import { sportybetAdapter } from './sportybet'

/** Add new bookmaker adapters here as they're built. */
export const adapters: BetSiteAdapter[] = [sportybetAdapter]

export function findAdapter(capture: CapturedRequest): BetSiteAdapter | undefined {
  return adapters.find((adapter) => adapter.matches(capture))
}
