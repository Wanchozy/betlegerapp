import './popup.css'
import { hasSupabaseConfig } from '@betledger/shared'

interface DebugLogEntry {
  url: string
  method: string
  requestBody: string | null
  responseBody: string | null
  timestamp: number
  adapterMatched: string | null
  betsCreated: number
}

const statusEl = document.getElementById('status') as HTMLParagraphElement
const countEl = document.getElementById('count') as HTMLElement
const logEl = document.getElementById('log') as HTMLUListElement
const copyBtn = document.getElementById('copy') as HTMLButtonElement
const clearBtn = document.getElementById('clear') as HTMLButtonElement

async function render() {
  statusEl.textContent = hasSupabaseConfig()
    ? 'Connected to Supabase'
    : 'Not configured - add Supabase env vars and rebuild'

  const stored = await chrome.storage.local.get(['capturedCount', 'debugLog'])
  const capturedCount: number = stored.capturedCount ?? 0
  const debugLog: DebugLogEntry[] = stored.debugLog ?? []

  countEl.textContent = String(capturedCount)

  logEl.innerHTML = ''
  if (debugLog.length === 0) {
    const empty = document.createElement('li')
    empty.textContent = 'No requests captured yet. Place a bet on a supported site.'
    logEl.appendChild(empty)
    return
  }

  for (const entry of debugLog) {
    const li = document.createElement('li')
    const time = new Date(entry.timestamp).toLocaleTimeString()
    const status =
      entry.betsCreated > 0
        ? `saved ${entry.betsCreated}`
        : entry.adapterMatched
          ? 'seen, no new bets'
          : 'unmatched'
    li.textContent = `${time} - ${entry.method} ${entry.url} (${status})`
    logEl.appendChild(li)
  }
}

copyBtn.addEventListener('click', async () => {
  const stored = await chrome.storage.local.get('debugLog')
  await navigator.clipboard.writeText(JSON.stringify(stored.debugLog ?? [], null, 2))
  copyBtn.textContent = 'Copied!'
  setTimeout(() => (copyBtn.textContent = 'Copy log'), 1500)
})

clearBtn.addEventListener('click', async () => {
  await chrome.storage.local.set({ debugLog: [], capturedCount: 0 })
  await chrome.action.setBadgeText({ text: '' })
  render()
})

chrome.storage.onChanged.addListener(render)
render()
