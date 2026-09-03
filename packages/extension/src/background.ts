import { createBetsRepository, getCurrentUserId } from '@betledger/shared'
import { findAdapter } from './adapters'
import type { CapturedRequest } from './messaging'

const repository = createBetsRepository()

const DEBUG_LOG_LIMIT = 50

interface DebugLogEntry extends CapturedRequest {
  adapterMatched: string | null
  betCreated: boolean
}

async function appendDebugLog(entry: DebugLogEntry) {
  const stored = await chrome.storage.local.get('debugLog')
  const debugLog: DebugLogEntry[] = stored.debugLog ?? []
  const next = [entry, ...debugLog].slice(0, DEBUG_LOG_LIMIT)
  await chrome.storage.local.set({ debugLog: next })
}

async function incrementCapturedCount() {
  const stored = await chrome.storage.local.get('capturedCount')
  const capturedCount: number = stored.capturedCount ?? 0
  const next = capturedCount + 1
  await chrome.storage.local.set({ capturedCount: next })
  await chrome.action.setBadgeText({ text: String(next) })
  await chrome.action.setBadgeBackgroundColor({ color: '#1d4d3e' })
}

async function handleCapturedRequest(capture: CapturedRequest) {
  const adapter = findAdapter(capture.url)
  const formData = adapter?.parseBetPlacement(capture) ?? null

  if (formData) {
    try {
      await repository.createBet(getCurrentUserId(), formData)
      await incrementCapturedCount()
    } catch (error) {
      console.error('[BetLedger] Failed to save captured bet:', error)
    }
  }

  await appendDebugLog({
    ...capture,
    adapterMatched: adapter?.id ?? null,
    betCreated: Boolean(formData),
  })
}

chrome.runtime.onMessage.addListener((message: { type?: string; payload?: CapturedRequest }, _sender, sendResponse) => {
  if (message?.type === 'CAPTURED_REQUEST' && message.payload) {
    handleCapturedRequest(message.payload).then(() => sendResponse({ ok: true }))
    return true // keep the message channel open until the async work above finishes
  }
  return false
})
