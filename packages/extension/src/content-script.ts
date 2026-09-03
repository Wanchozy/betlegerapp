/**
 * Runs in the extension's normal ("ISOLATED") world alongside the page. It
 * can't see the page's real `fetch`/`XMLHttpRequest` (inject.ts handles
 * that from the MAIN world), but it *can* call `chrome.runtime`, so its only
 * job is relaying captured requests from the page to the background worker.
 */
import { isCapturedRequestWindowMessage } from './messaging'

window.addEventListener('message', (event) => {
  if (event.source !== window) return
  if (!isCapturedRequestWindowMessage(event.data)) return

  chrome.runtime.sendMessage({
    type: 'CAPTURED_REQUEST',
    payload: event.data.payload,
  })
})
