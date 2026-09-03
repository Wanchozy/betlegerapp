import type { BetFormData } from '@betledger/shared'
import type { CapturedRequest } from '../messaging'

export interface BetSiteAdapter {
  /** Stable id, also shown in the debug log to say which adapter (if any) matched. */
  id: string
  label: string
  /** Whether this adapter is responsible for requests to this URL. */
  matches(url: string): boolean
  /**
   * Attempts to turn a captured network request into a bet ready to save.
   * Returns `null` if this particular request isn't a bet placement (e.g. a
   * balance check that happened to mention "bet" in its URL).
   */
  parseBetPlacement(capture: CapturedRequest): BetFormData | null
}
