# PWA (Progressive Web App) -- Healthia

## Overview

Healthia is configured as a Progressive Web App. The PWA adds installability, offline support, and background sync to the existing Next.js static-export frontend without any plugin or framework dependency beyond the `idb` library.

**Key capabilities:**

- Installable to home screen (Android, iOS, desktop)
- Offline app shell (HTML/JS/CSS cached by the service worker)
- Offline data reads (last-known-good vitals, profile, and recommendations served from IndexedDB)
- Offline vitals entry (queued in IndexedDB and synced when connectivity returns)
- Background Sync (SW fires `sync-vitals` when the browser detects connectivity)
- Custom install prompt (`beforeinstallprompt` banner)

---

## Architecture

```
Browser
  Next.js App (static export)
    |-- registers --> Service Worker (public/sw.js)
    |-- reads/writes --> IndexedDB ("healthia-offline")
  Service Worker
    |-- intercepts fetch --> Cache Storage (app shell + API responses)
    |-- Background Sync --> NestJS API
  IndexedDB
    |-- pendingVitals store (offline queue)
    |-- cachedData store (vitals, profile, recommendations, authToken, apiUrl)
```

### Caching strategies

| Request type | Strategy | Details |
|---|---|---|
| App shell (HTML, JS, CSS, images) | Cache-first, stale-while-revalidate | Pre-cached on SW install; served from cache, updated in background |
| API GET (`/patients/vitals`, `/patients/profile`, `/recommendations/daily`) | Network-first, fall back to cache | On success: response cloned into Cache Storage + IndexedDB. On failure: serve stale from cache/IDB |
| API POST/PATCH | Network-only | Offline POST handled by app-level IndexedDB queue, not the SW |

### Background Sync flow

1. User submits a vital while offline (or on a flaky connection that fails)
2. Payload is saved to `pendingVitals` in IndexedDB
3. A Background Sync tag `sync-vitals` is registered with the SW
4. When the browser regains connectivity, the SW `sync` event fires
5. The SW reads all pending entries, POSTs each to `/patients/vitals`, and removes successful ones
6. As a fallback, the app also listens for the `online` event and drains the queue eagerly

---

## File structure

### New files

```
frontend/
  public/
    manifest.json                       # Web App Manifest
    sw.js                               # Service Worker (hand-written, Cache API + Background Sync)
    icons/
      icon-192x192.png                  # Required PWA icon (placeholder)
      icon-512x512.png                  # Required PWA icon (placeholder)
      icon-maskable-512x512.png         # Maskable icon for Android (placeholder)
      apple-touch-icon.png              # iOS home screen 180x180 (placeholder)
  scripts/
    generate-pwa-icons.mjs              # Zero-dep script to regenerate placeholder icons
  src/
    lib/pwa/
      register-sw.ts                    # SW registration + update detection
      offline-store.ts                  # IndexedDB wrapper (idb): pendingVitals + cachedData
      sync-manager.ts                   # Drain offline queue, request Background Sync
      use-online-status.ts              # React hook: { isOnline, pendingCount }
    components/pwa/
      ServiceWorkerRegistrar.tsx        # Client component: registers SW on mount (in root layout)
      OfflineBanner.tsx                 # Amber top bar when offline
      PendingSyncBadge.tsx              # Badge on Add nav tab for queued vitals
      InstallPrompt.tsx                 # "Add to Home Screen" banner
```

### Modified files

| File | What changed |
|---|---|
| `src/app/layout.tsx` | Manifest link, `theme-color` viewport, apple-touch-icon, `<ServiceWorkerRegistrar />` |
| `src/app/globals.css` | `@keyframes slideUp` for install prompt animation |
| `src/lib/api.ts` | `authGet` caches responses to IndexedDB; on network failure, serves from cache |
| `src/pages/LoginForm.tsx` | Persists JWT + API URL to IndexedDB after login (for SW Background Sync) |
| `src/components/add/AddVitalsForm.tsx` | Offline-aware submit: queues to IndexedDB when offline; drains queue on mount |
| `src/components/Dashboard.tsx` | Shows "cached data" indicator when serving from offline cache |
| `src/components/layout/AppShell.tsx` | Renders `<OfflineBanner />` and `<InstallPrompt />` |
| `src/components/layout/AppNav.tsx` | Shows `<PendingSyncBadge />` on the Add tab |

### Dependencies

- `idb` v8 (~1.2 KB gzipped) -- typed IndexedDB wrapper. No PWA plugin needed.

---

## Offline feature matrix

| Feature | Offline behavior |
|---|---|
| **Add Vitals** | Fully functional -- form works, saved to IndexedDB, synced when online |
| **Dashboard** | Read-only -- shows last cached vitals from IndexedDB |
| **Recommendations** | Read-only -- shows last cached recommendations |
| **Profile (view)** | Read-only -- shows cached profile |
| **Profile (edit)** | Disabled -- requires internet |
| **Login** | Online only -- needs API; if JWT is still valid, app shell works offline |
| **Charts** | Work offline (SVG rendered client-side from cached data) |

---

## Running the PWA

### Development

```bash
# From the frontend/ directory
npm run dev
```

- Service workers are **not** active during `next dev` (no SW caching in dev).
- The manifest is served and the app is "installable" in Chrome DevTools > Application.
- Offline store (IndexedDB) works normally in dev.

### Production build + local preview

```bash
# Build the static export
npm run build

# Serve the static output with a local HTTP server (HTTPS recommended for full PWA)
npx serve out
```

- The SW (`sw.js`) will register and pre-cache the app shell.
- Open Chrome DevTools > Application > Service Workers to verify registration.
- Use DevTools > Network > Offline checkbox to test offline mode.

### Production deployment

The `out/` directory is a fully static site. Deploy it to any static host:

- **Vercel** (auto-detected from `output: 'export'`)
- **Netlify**, **Cloudflare Pages**, **AWS S3 + CloudFront**
- Any server that can serve static files over HTTPS

**HTTPS is required** for service workers and PWA installability in production.

### Regenerating placeholder icons

```bash
# From the frontend/ directory
node scripts/generate-pwa-icons.mjs
```

Replace the generated files in `public/icons/` with real branded icons when ready. Required sizes: 192x192, 512x512 (regular + maskable), 180x180 (apple-touch).

### Testing the PWA

1. **Installability**: Open the app in Chrome. Look for the install icon in the address bar, or wait for the custom `InstallPrompt` banner.
2. **Offline shell**: In DevTools > Application > Service Workers, check "Offline". Reload -- the app shell should load from cache.
3. **Offline vitals**: With "Offline" checked, go to Add > fill in vitals > Save. You should see the amber "saved offline" confirmation. Uncheck "Offline" -- the vitals should sync automatically.
4. **Lighthouse audit**: Run Lighthouse > PWA audit. The app should pass installability and offline checks (with HTTPS).
5. **Background Sync**: In DevTools > Application > Background Sync, you can see registered tags (`sync-vitals`).

---

## Cache versioning

When you deploy a new version, bump the cache name suffix in `public/sw.js`:

```js
const SHELL_CACHE = "healthia-shell-v2";  // was v1
const API_CACHE = "healthia-api-v2";      // was v1
```

The `activate` event handler automatically deletes old caches.

---

## Future work (not yet implemented)

- **Push notifications** -- requires backend VAPID key setup and a `/push/subscribe` endpoint
- **Capacitor native shell** -- wrap the PWA in a native iOS/Android app for store distribution
- **Offline profile editing** -- with conflict resolution on sync
- **Periodic background sync** -- auto-fetch new recommendations in the background
- **Final branded icons** -- replace placeholders with designed assets
