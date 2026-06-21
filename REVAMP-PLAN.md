# Revamp Plan — `revamp/fixes-and-redesign`

## Health Check Results

| Layer | Status |
|-------|--------|
| Backend `php artisan test` | **42 passed, 104 assertions, 0 failures** (32.6s) |
| Frontend `npm install` | OK — 20 audit vulnerabilities (non-blocking) |
| Frontend `npm run build` | **Clean build, 0 errors** (17.5s, Vite 5.4.19) |

---

## Current Condition: Findings

### Backend

#### BUG — Notification fired on every GET (PortfolioController)
`PortfolioController::index()` and `::show()` both call
`$this->notifications->maybeSendPortfolioChange($user)` on **read** requests.
That runs extra DB queries (portfolio + items eager-load) and cache reads/writes
on every page load, and can fire a push notification when the user merely opens
the page. Notifications should only be triggered by mutations
(`PortfolioItemController::store/update/destroy`), where it is correctly wired.

#### PERFORMANCE — Portfolio notification uses cost basis, not live price
`NotificationTriggerService::maybeSendPortfolioChange` computes portfolio value
as `SUM(quantity × average_cost)`. This is the static cost basis, not the current
market value. The cached "previous" value only changes when the user adds, edits,
or removes items — never from market price movement. The 1% threshold check
therefore fires on structural changes to the portfolio, not on P/L swings. The
intent (alert on value change) is mismatched to the implementation.

#### PERFORMANCE — Push notifications sent synchronously on HTTP thread
`QUEUE_CONNECTION=database` is configured and the `jobs` migration exists, but
`PushNotificationService::sendToUser` calls `Minishlink\WebPush\WebPush::flush()`
synchronously inside the request lifecycle. Heavy push batches (many subscribers)
block the HTTP response. Push sends should be dispatched as queued jobs.

#### VALIDATION — `average_cost` accepts 0 in PortfolioItemRequest
`PortfolioItemRequest` validates `average_cost` with `min:0`, meaning a cost
of exactly `0` passes. The frontend enforces `> 0`, but the backend should mirror
this (use `min:0.000001` or a custom rule). Without backend validation, a direct
API call can create a holding with zero cost, causing division-by-zero in P/L%.

---

### Frontend

#### BUG — Mobile users cannot edit or remove holdings (Portfolio.tsx)
The holdings table header and action column use `hidden md:grid` / `hidden md:flex`
/ `hidden md:block`. On screens narrower than `md` (768 px), the Shares, Avg Cost,
Value, and **Alloc** columns are hidden — and with them, the edit pencil and delete
button. Mobile users can see holdings but have **no way to manage them**.

#### BUG — Inline edit error display shows only one validation error (Portfolio.tsx:493)
```ts
{editErrors.quantity ?? editErrors.averageCost}
```
The nullish-coalescing operator means only the quantity error is shown even when
both fields are invalid. Users editing both fields at once get incomplete feedback.

#### UX BUG — Symbol validation error lingers after sanitization (Settings.tsx)
`handleDefaultSymbolChange` strips invalid characters from the input (`sanitized`)
and then checks `upper` (pre-sanitize) to set an error. When the sanitized value
matches the already-saved `defaultSymbol`, the debounce's early-return guard
(`defaultSymbolError || defaultSymbolInput === defaultSymbol`) prevents the next
save, locking the error banner permanently until the user types another character.

#### DESIGN — Dark mode is hardcoded; theme toggle is a no-op
`useSettings` forces `theme: 'dark'` in both `withSettingsDefaults` and
`mergeSettingsUpdate`. Light-mode CSS variables exist in `:root` but are never
applied. The Settings page has no theme toggle — accidental but creates a gap
between stated flexibility (density, font size, accent color) and missing light mode.

#### UX — Push subscription state not re-validated after initial mount
`usePushNotifications` calls `getSubscription()` once on mount. If the user revokes
browser notification permission externally (browser settings), the hook keeps
`isSubscribed: true` and shows the toggle as enabled with no indication of the mismatch.

---

## 4-Step Revamp Plan

### Step 1 — Bug Fixes: Portfolio & Settings

**Backend:**
- Remove `maybeSendPortfolioChange` calls from `PortfolioController::index()` and
  `::show()` — leave them only in `PortfolioItemController`.
- Change `PortfolioItemRequest` `average_cost` rule from `min:0` to `min:0.000001`.

**Frontend:**
- `Portfolio.tsx`: Add a mobile action row (swipe-reveal or bottom sheet) so users
  on `< md` screens can still edit and delete holdings. Minimum fix: move action
  buttons outside the hidden column into a visible slot.
- `Portfolio.tsx` line 493: Replace `??` with `\n` join or render both errors.
- `Settings.tsx` `handleDefaultSymbolChange`: Clear `defaultSymbolError` at the top
  of the function before re-evaluating, so the error does not persist after the input
  already matches the saved value.
- `usePushNotifications`: Add a `visibilitychange` listener (or periodic check) to
  re-call `getSubscription()` and re-sync `Notification.permission` when the tab
  regains focus.

---

### Step 2 — Backend Performance & Queue

- Wrap `PushNotificationService::sendToUser` in a queued job (`SendPushNotification`)
  dispatched via `dispatch()->onQueue('push')`. This removes the blocking HTTP
  overhead.
- Fix `maybeSendPortfolioChange` to accept a pre-computed `$valueDelta` float (passed
  by `PortfolioItemController` after fetching live price or cost-basis estimate)
  instead of re-querying the entire portfolio. This avoids the N+1 eager-load.
- Add a `CheckPushNotifications` artisan command schedule (already exists in
  `app/Console/Commands/`) — ensure it is registered in `routes/console.php`.
- Add feature tests for `PortfolioItemController` covering the notification trigger
  behaviour (currently only ownership tests exist, no notification smoke tests).

---

### Step 3 — UI Redesign: Portfolio & Settings Pages

**Portfolio:**
- Redesign the holdings table with a responsive card layout for mobile: each holding
  becomes a stacked card with all 7 fields visible, plus inline edit/delete actions.
- Add a real pie/donut chart (using the existing `recharts` bundle) in the Allocation
  panel instead of the CSS bar — the recharts bundle is already in the build (~406 kB).
- Add portfolio P/L sparkline at the top (7-day trend line via candle data).
- Best/Worst performer cards: expand to show absolute dollar P/L alongside percentage.

**Settings:**
- Add a light/dark mode toggle that actually applies `data-theme` to `:root`, wiring
  through `ThemeContext` (already exists in `frontend/src/context/ThemeContext.tsx`).
- Group settings cards into a tab layout (Account / Display / Notifications / Advanced)
  to reduce vertical scroll on the single-column mobile view.
- Symbol input: replace the raw text input with a search-ahead combo-box that
  validates the symbol against the Finnhub profile endpoint before saving.

---

### Step 4 — Hardening & Polish

- **npm audit**: Address the 1 critical and 12 high vulnerabilities from `npm audit`
  (`npm audit fix --force` where safe; manual upgrades where breaking).
- **Watchlist sort "Volume"**: Settings `sort_by` allows `Volume` but the UI maps it
  away to `'Change'` with an inline ternary. Either add Volume as a real option or
  remove it from the data model.
- **Empty portfolio mobile UX**: When holdings list is empty on mobile, the
  `EmptyState` CTA ("Add holding") opens the form but the form is hidden on small
  screens — fix by opening a modal instead.
- **Accessibility**: All icon-only buttons in Portfolio table need visible focus rings
  and `aria-label` (partially present but not consistent).
- **Error boundary**: Wrap each dashboard widget in a React error boundary so a
  single failing hook (e.g., Finnhub 429) does not blank the whole page.
