# BetLedger Capture (browser extension)

Captures bets placed on supported sportsbooks and syncs them straight into
your BetLedger Supabase database - no manual entry or CSV needed, once a
site's adapter is finished.

## Status: SportyBet adapter is working, with one known limitation

SportyBet encrypts its actual "place bet" call (`/api/tz/orders/order`), so
that can't be read directly. Instead, the adapter reads the `cashAbleBet(s)`
endpoints that power SportyBet's own "Open Bets"/cash-out UI, which return
full bet details as plain JSON.

**Practical effect:** a bet gets synced to BetLedger once you view "My
Bets"/"Open Bets" after placing it (which most people do anyway to confirm
the slip went through) - not necessarily the instant you click "place bet".

Because that endpoint only ever returns *unsettled* bets, everything is
recorded as `pending` for now - there's no capture point yet for when a bet
settles as a win/loss (that needs whatever endpoint powers the settled "Bet
History" tab, not yet captured). Stake is also stored as a raw number with no
currency conversion, so non-USD accounts will show the right number in the
wrong currency until that's added.

Every bet-related request the extension sees is still logged locally (the
popup's "Debug log"), which is how the adapter above was built and how
future adapters/refinements can be too.

## How it works

1. `src/inject.ts` runs in the sportsbook page's own JS context and patches
   `fetch`/`XMLHttpRequest` to see outgoing requests whose URL looks
   bet-related (contains "bet", "wager", "slip", "order", "stake", etc). It
   only reads the URL, method, and body - **never headers**, so auth tokens
   and session cookies are never captured.
2. `src/content-script.ts` relays those captures to the background worker
   (only a content script, not a page script, can talk to the extension).
3. `src/background.ts` runs the capture through the adapter registry
   (`src/adapters`). If an adapter recognizes it as an actual bet placement,
   it writes the bet to Supabase using `@betledger/shared`'s existing
   `createBetsRepository()` - the same code path the web app uses. Either
   way, the raw capture is logged to `chrome.storage.local` for debugging.
4. The popup (`src/popup.ts`) shows how many bets have synced and lets you
   copy the debug log to share it for building a real adapter.

## Setup

```sh
cd packages/extension
cp .env.example .env
# edit .env with the same VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY as packages/web/.env
npm run build -w packages/extension
```

This produces `packages/extension/dist`.

## Load it in Chrome

1. Go to `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" and select `packages/extension/dist`
4. Pin the extension so you can see its popup

Rebuild (`npm run build -w packages/extension`) and click the refresh icon on
the extension card in `chrome://extensions` after any code change.

## Finishing the SportyBet adapter

1. With the extension loaded, log into SportyBet and place a bet (or view
   your bet history, if that also fires a bet-related request).
2. Open the extension popup - you should see entries appear in the debug log.
3. Click "Copy log" and review it: **redact anything sensitive** (balances,
   personal info) before sharing it.
4. Share the relevant entry (URL + response body) so `src/adapters/sportybet.ts`
   can be filled in with the real field mapping to `BetFormData`.
5. Rebuild and reload the extension - matching requests will now create real
   bets automatically.

## Adding another sportsbook

1. Add its domain to `host_permissions` and both `content_scripts` `matches`
   arrays in `manifest.json`.
2. Create `src/adapters/<site>.ts` implementing `BetSiteAdapter` (see
   `sportybet.ts` for the shape).
3. Register it in `src/adapters/index.ts`.

## Known limitations (by design, for now)

- Single hardcoded demo user (matches the rest of the app - see
  `@betledger/shared`'s `getCurrentUserId()`). Once BetLedger has real
  per-user auth, this extension will need a pairing step (e.g. an API token
  generated in BetLedger settings) instead of writing to Supabase directly
  with the shared anon key.
- Chrome (Manifest V3) only for now. Firefox support would need a small
  polyfill layer (`webextension-polyfill`) since `chrome.*` APIs differ
  slightly there.
- `"world": "MAIN"` content scripts require Chrome 111+.
