import { createClient } from '@supabase/supabase-js'
import { createBetsRepository, getCurrentUserId } from '@betledger/shared'
import { findAdapter } from './adapters'
import type { CapturedRequest } from './messaging'

/**
 * A service worker has no `document`/`window` (it's not a page - MV3
 * background scripts run in a Worker context), but @betledger/shared's
 * default `getSupabase()` creates a client with browser-oriented auth
 * features (session persistence, auto-refresh, URL session detection) that
 * try to touch those globals and throw `ReferenceError: document is not
 * defined`. This extension doesn't manage a logged-in session at all (it
 * just writes with the anon key), so those features are disabled here
 * instead of changing the shared default for web/mobile, which still rely on
 * normal browser session handling.
 */
const env = (import.meta as Record<string, any>).env ?? {}
const supabaseUrl: string | undefined = env.VITE_SUPABASE_URL
const supabaseAnonKey: string | undefined = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[BetLedger] Missing Supabase env vars - copy packages/extension/.env.example to .env, fill it in, and rebuild.'
  )
}

const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})

const repository = createBetsRepository(supabase)

const DEBUG_LOG_LIMIT = 50
const SYNCED_IDS_LIMIT = 1000

interface DebugLogEntry extends CapturedRequest {
  adapterMatched: string | null
  betsCreated: number
}

async function appendDebugLog(entry: DebugLogEntry) {
  const stored = await chrome.storage.local.get('debugLog')
  const debugLog: DebugLogEntry[] = stored.debugLog ?? []
  const next = [entry, ...debugLog].slice(0, DEBUG_LOG_LIMIT)
  await chrome.storage.local.set({ debugLog: next })
}

async function wasAlreadySynced(externalId: string): Promise<boolean> {
  const stored = await chrome.storage.local.get('syncedExternalIds')
  const ids: string[] = stored.syncedExternalIds ?? []
  return ids.includes(externalId)
}

/**
 * The same open bet gets returned every time SportyBet (or any similar site)
 * polls its "open bets" endpoint, so without this, every poll would create
 * another duplicate row in Supabase for the same real-world bet.
 */
async function markSynced(externalId: string) {
  const stored = await chrome.storage.local.get('syncedExternalIds')
  const ids: string[] = stored.syncedExternalIds ?? []
  const next = [externalId, ...ids].slice(0, SYNCED_IDS_LIMIT)
  await chrome.storage.local.set({ syncedExternalIds: next })
}

async function incrementCapturedCount(by: number) {
  const stored = await chrome.storage.local.get('capturedCount')
  const capturedCount: number = stored.capturedCount ?? 0
  const next = capturedCount + by
  await chrome.storage.local.set({ capturedCount: next })
  await chrome.action.setBadgeText({ text: String(next) })
  await chrome.action.setBadgeBackgroundColor({ color: '#1d4d3e' })
}

async function handleCapturedRequest(capture: CapturedRequest) {
  const adapter = findAdapter(capture)
  const parsedBets = adapter?.parseBetPlacements(capture) ?? []

  let created = 0
  for (const bet of parsedBets) {
    if (await wasAlreadySynced(bet.externalId)) continue

    try {
      await repository.createBet(getCurrentUserId(), bet.formData)
      await markSynced(bet.externalId)
      created += 1
    } catch (error) {
      console.error('[BetLedger] Failed to save captured bet:', error)
    }
  }

  if (created > 0) {
    await incrementCapturedCount(created)
  }

  await appendDebugLog({
    ...capture,
    adapterMatched: adapter?.id ?? null,
    betsCreated: created,
  })
}

chrome.runtime.onMessage.addListener(
  (message: { type?: string; payload?: CapturedRequest }, _sender, sendResponse) => {
    if (message?.type === 'CAPTURED_REQUEST' && message.payload) {
      handleCapturedRequest(message.payload).then(() => sendResponse({ ok: true }))
      return true // keep the message channel open until the async work above finishes
    }
    return false
  }
)
