/**
 * Runs in the page's own JS context (manifest "world": "MAIN"), so it can
 * patch the *real* `window.fetch`/`XMLHttpRequest` that the sportsbook site
 * itself uses. This only works from the MAIN world - the extension's normal
 * isolated content-script world sees a separate copy of these globals that
 * the page never calls.
 *
 * Only requests whose URL looks bet-related are captured (see
 * `looksBetRelated`), and only the URL/method/body are read - no headers, so
 * auth tokens and cookies are never captured here.
 */
import { CAPTURE_MESSAGE_SOURCE, capText, looksBetRelated, type CapturedRequest } from './messaging'

function postCapture(capture: CapturedRequest) {
  window.postMessage(
    { source: CAPTURE_MESSAGE_SOURCE, type: 'BETLEDGER_CAPTURED_REQUEST', payload: capture },
    window.location.origin
  )
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input
  if (input instanceof URL) return input.toString()
  return input.url
}

const originalFetch = window.fetch.bind(window)

window.fetch = async function patchedFetch(...args: Parameters<typeof fetch>) {
  const [input, init] = args
  const url = resolveUrl(input)
  const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase()

  const response = await originalFetch(...args)

  if (looksBetRelated(url)) {
    response
      .clone()
      .text()
      .then((responseBody) => {
        postCapture({
          url,
          method,
          requestBody: capText(typeof init?.body === 'string' ? init.body : null),
          responseBody: capText(responseBody),
          timestamp: Date.now(),
        })
      })
      .catch(() => {
        /* Body wasn't readable as text (binary, already consumed, etc.) - skip it. */
      })
  }

  return response
}

const OriginalXHR = window.XMLHttpRequest

class PatchedXHR extends OriginalXHR {
  private betledgerUrl = ''
  private betledgerMethod = 'GET'
  private betledgerBody: string | null = null

  open(method: string, url: string | URL, ...rest: unknown[]): void {
    this.betledgerMethod = method.toUpperCase()
    this.betledgerUrl = url.toString()
    ;(super.open as (...openArgs: unknown[]) => void)(method, url, ...rest)
  }

  send(body?: Document | XMLHttpRequestBodyInit | null): void {
    this.betledgerBody = typeof body === 'string' ? body : null

    if (looksBetRelated(this.betledgerUrl)) {
      this.addEventListener('loadend', () => {
        postCapture({
          url: this.betledgerUrl,
          method: this.betledgerMethod,
          requestBody: capText(this.betledgerBody),
          responseBody: capText(typeof this.responseText === 'string' ? this.responseText : null),
          timestamp: Date.now(),
        })
      })
    }

    super.send(body)
  }
}

window.XMLHttpRequest = PatchedXHR as unknown as typeof XMLHttpRequest
