# Offline vitals submission (mobile apps)

## Purpose

Mobile apps (iOS/Android via Capacitor) let users record vitals while offline or on a flaky connection; queued entries sync to the backend when connectivity returns, without requiring the user to stay in the app or manually retry.

## Scope

- **Platform**: Capacitor native apps (iOS and Android). Web PWA has its own offline flow (Service Worker + Background Sync); this spec focuses on the mobile-native path.
- **Data**: Vitals only (heart rate, blood pressure, weight, height, sleep, stress, SpO₂, blood glucose). Document uploads (prescriptions, lab results) are out of scope.
- **Behavior**: Queue vitals in local storage when offline or on API failure; drain the queue when online; show “saved offline” and sync status in the UI.
- **Shared pieces**: Uses the same backend `POST /patients/vitals` endpoint, the same `CreateVitalPayload` shape, and ideally shares the offline store and sync logic with the PWA (IndexedDB + sync-manager).

## Context

- **PWA**: Uses IndexedDB (`healthia-offline`, `pendingVitals`), Service Worker Background Sync (`sync-vitals`), and window `online` event. See `docs/pwa.md`.
- **Capacitor**: Service Worker is intentionally not registered in native apps (see `register-sw.ts`). Offline behavior relies on:
  - IndexedDB (available in the WebView)
  - ` sync-manager` drain triggered by window `online` and `AddVitalsForm` mount
  - No Background Sync (no SW in native), so sync only runs when the app is open and connectivity is detected.

## Acceptance criteria

### Queue and submit

- When the user submits vitals while offline (or on a failed POST), the app queues the payload in local storage and shows “saved offline” (or equivalent) in the Add flow.
- When the user submits vitals while online, the app posts to `POST /patients/vitals`; on success, shows normal success; on network/server error, falls back to queue-and-show-“saved offline”.
- Queued vitals use the same payload structure as `add-vitals-lab-results-api.md` (date required; optional heart rate, blood pressure, weight, height, sleep, stress, SpO₂, blood glucose).

### Sync when online

- When connectivity returns and the app is in the foreground, the queued vitals are synced to the backend within a reasonable time (e.g. within seconds of the `online` event or equivalent).
- Successful syncs remove entries from the queue; failed syncs (e.g. 5xx, timeout) leave them for a later attempt.
- When the user’s token has expired (401), sync stops; the user must re-login; queued vitals remain for the next authenticated session.

### App lifecycle (mobile-specific)

- When the app is brought to the foreground (e.g. user returns after connectivity was restored while app was backgrounded), the app attempts to drain the pending vitals queue.
- Optionally: use `@capacitor/network` to detect connectivity more reliably than `navigator.onLine` on mobile; sync when status changes to connected.

### UI feedback

- When there are queued vitals, the Add tab shows a badge or indicator (e.g. “X pending sync”); this matches the PWA `PendingSyncBadge` behavior.
- An offline banner or indicator is shown when the device is offline, consistent with the PWA `OfflineBanner`.
- After a successful offline save, the user sees “saved offline” and can continue adding more vitals or navigate away; no blocking or forced retry.

### Storage

- Pending vitals are stored in a durable store (IndexedDB or Capacitor-backed equivalent). Data survives app restart and device reboot.
- If the app runs in both PWA and Capacitor from the same WebView origin, the same store can be used; avoid duplicate queues or divergent schemas.

## Out of scope

- Offline document uploads (prescriptions, lab results); those remain online-only for this spec.
- Offline profile editing or conflict resolution.
- Batch/bulk submission endpoint (backend continues to accept single-vital `POST`; client sends one request per queued entry).
- PWA-specific behavior (Service Worker, Background Sync); see `docs/pwa.md` and `add-vitals-lab-results-ui.md`.

## References

- `add-vitals-lab-results-api.md` — Vitals API contract
- `add-vitals-lab-results-ui.md` — Add flow and offline UX mentions
- `docs/pwa.md` — PWA offline architecture
- `docs/data_model.md` — UserVitals schema
