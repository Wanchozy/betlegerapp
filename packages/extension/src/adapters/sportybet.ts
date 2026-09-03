import type { BetFormData } from '@betledger/shared'
import type { CapturedRequest } from '../messaging'
import type { BetSiteAdapter } from './types'

/**
 * Adapter for SportyBet.
 *
 * NOT FINISHED YET: SportyBet's real "place bet" endpoint and response shape
 * haven't been captured yet, so this deliberately returns `null` for
 * everything - nothing gets written to Supabase until it's filled in for
 * real. In the meantime, the extension's popup still logs every bet-related
 * request it sees (URL, method, body), so real samples can be collected from
 * the popup's "Copy log" button and used to finish this file.
 *
 * To finish this adapter:
 *   1. Place a real bet on SportyBet with the extension installed.
 *   2. Open the extension popup, find the request that looks like the actual
 *      "place bet" call, and copy the log.
 *   3. Replace the URL match below and map the real response fields to
 *      `BetFormData`.
 */
export const sportybetAdapter: BetSiteAdapter = {
  id: 'sportybet',
  label: 'SportyBet',

  matches(url) {
    return /sportybet\.com/i.test(url)
  },

  parseBetPlacement(capture: CapturedRequest): BetFormData | null {
    // TODO: narrow this to the real "place bet" endpoint once known, e.g.:
    // if (!/\/orders\/place/i.test(capture.url)) return null

    if (!capture.responseBody) return null

    let data: unknown
    try {
      data = JSON.parse(capture.responseBody)
    } catch {
      return null
    }

    // TODO: map the real response shape to BetFormData once known. Returning
    // `null` for now is intentional - see the file comment above.
    void data
    return null
  },
}
