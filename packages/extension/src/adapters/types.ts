import type { BetFormData } from '@betledger/shared'
import type { CapturedRequest } from '../messaging'

export interface ParsedBet {
  /**
   * A stable id from the source site (e.g. SportyBet's own bet id), used to
   * avoid creating duplicate bets when the same bet shows up again in a
   * later capture (the same "open bets" endpoint gets polled repeatedly).
   */
  externalId: string
  formData: BetFormData
}

export interface BetSiteAdapter {
  /** Stable id, also shown in the debug log to say which adapter (if any) matched. */
  id: string
  label: string
  /** Whether this adapter is responsible for requests seen on this page/URL. */
  matches(capture: CapturedRequest): boolean
  /** Returns every bet found in this capture (zero, one, or many). */
  parseBetPlacements(capture: CapturedRequest): ParsedBet[]
}
