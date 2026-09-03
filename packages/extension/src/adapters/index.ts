import type { BetSiteAdapter } from './types'
import { sportybetAdapter } from './sportybet'

/** Add new bookmaker adapters here as they're built. */
export const adapters: BetSiteAdapter[] = [sportybetAdapter]

export function findAdapter(url: string): BetSiteAdapter | undefined {
  return adapters.find((adapter) => adapter.matches(url))
}
