/**
 * Shared message protocol between the three extension contexts:
 *
 *   inject.ts (page's own JS context, "MAIN" world)
 *     -> window.postMessage
 *   content-script.ts (extension's isolated world, runs alongside the page)
 *     -> chrome.runtime.sendMessage
 *   background.ts (service worker)
 *
 * This indirection exists because only a "MAIN" world script can monkeypatch
 * the page's real `window.fetch`/`XMLHttpRequest` to see bet-placement
 * traffic, but only an "ISOLATED" world script (the content script) can call
 * `chrome.runtime`. So inject.ts observes, content-script.ts relays.
 */

export const CAPTURE_MESSAGE_SOURCE = 'betledger-extension'

export interface CapturedRequest {
  url: string
  method: string
  requestBody: string | null
  responseBody: string | null
  timestamp: number
}

export interface CapturedRequestWindowMessage {
  source: typeof CAPTURE_MESSAGE_SOURCE
  type: 'BETLEDGER_CAPTURED_REQUEST'
  payload: CapturedRequest
}

export function isCapturedRequestWindowMessage(data: unknown): data is CapturedRequestWindowMessage {
  const message = data as Partial<CapturedRequestWindowMessage> | null
  return (
    typeof message === 'object' &&
    message !== null &&
    message.source === CAPTURE_MESSAGE_SOURCE &&
    message.type === 'BETLEDGER_CAPTURED_REQUEST'
  )
}

/**
 * Keywords used to decide whether a network call is worth capturing at all,
 * so the extension doesn't hoover up every request a sportsbook page makes
 * (balance polling, analytics beacons, etc.) - just the ones that look like
 * they're related to placing or listing bets.
 */
export const BET_URL_KEYWORDS = ['bet', 'wager', 'slip', 'order', 'stake', 'placement']

export function looksBetRelated(url: string): boolean {
  const lower = url.toLowerCase()
  return BET_URL_KEYWORDS.some((keyword) => lower.includes(keyword))
}

/** Caps how much text is shuttled between contexts and stored locally. */
export function capText(text: string | null, maxLength = 20_000): string | null {
  if (!text) return null
  return text.length > maxLength ? text.slice(0, maxLength) : text
}
