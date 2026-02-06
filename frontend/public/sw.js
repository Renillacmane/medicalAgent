/**
 * Healthia PWA Service Worker
 *
 * Strategies:
 *   - App shell (HTML/JS/CSS/images): Cache-first, update in background
 *   - API GET requests:               Network-first, fall back to cache
 *   - API POST/PATCH:                 Network-only (offline handled by app-level IndexedDB queue)
 *   - Background Sync:                Drains the offline vitals queue when connectivity returns
 */

// ---- Cache names (bump suffix to bust) ----
const SHELL_CACHE = "healthia-shell-v1";
const API_CACHE = "healthia-api-v1";
const ALL_CACHES = [SHELL_CACHE, API_CACHE];

// ---- Helpers ----

/** Returns true if the URL points to our NestJS API. */
function isApiRequest(url) {
  // API requests go to a different origin or to paths like /patients, /recommendations, /auth
  const { pathname } = new URL(url);
  return (
    pathname.startsWith("/patients") ||
    pathname.startsWith("/recommendations") ||
    pathname.startsWith("/auth")
  );
}

/** Returns true for navigation and static-asset requests (our app shell). */
function isAppShellRequest(request) {
  // Anything that's NOT an API request and IS same-origin is part of the shell
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  return !isApiRequest(request.url);
}

// ---- Install: pre-cache critical shell assets ----

self.addEventListener("install", (event) => {
  // Skip waiting so the new SW activates immediately
  self.skipWaiting();

  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      // Pre-cache the app entry points.
      // With static export, every route is an HTML file.
      return cache.addAll([
        "/",
        "/dashboard",
        "/add",
        "/profile",
        "/recommendations",
        "/login",
        "/manifest.json",
        "/icons/icon-192x192.png",
        "/icons/icon-512x512.png",
      ]);
    })
  );
});

// ---- Activate: clean old caches ----

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !ALL_CACHES.includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open tabs immediately
  self.clients.claim();
});

// ---- Fetch: strategy router ----

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests in the SW; mutations are network-only
  if (request.method !== "GET") return;

  // API GET requests: network-first, fall back to cache
  if (isApiRequest(request.url)) {
    event.respondWith(networkFirstThenCache(request));
    return;
  }

  // App shell: cache-first, update cache in background
  if (isAppShellRequest(request)) {
    event.respondWith(cacheFirstThenNetwork(request));
    return;
  }

  // Everything else: default browser behavior
});

// ---- Strategies ----

async function networkFirstThenCache(request) {
  try {
    const response = await fetch(request);
    // Clone before consuming – cache the successful response
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Network failed – try cache
    const cached = await caches.match(request);
    if (cached) return cached;
    // Nothing cached either – return a simple offline JSON
    return new Response(
      JSON.stringify({ message: "You are offline and no cached data is available." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function cacheFirstThenNetwork(request) {
  const cached = await caches.match(request);
  if (cached) {
    // Update cache in background (stale-while-revalidate)
    updateCacheInBackground(request);
    return cached;
  }
  // Not cached yet – fetch from network and cache
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Offline and not cached – return a basic offline page
    return new Response(
      "<html><body><h1>Healthia</h1><p>You are offline.</p></body></html>",
      { status: 503, headers: { "Content-Type": "text/html" } }
    );
  }
}

function updateCacheInBackground(request) {
  fetch(request)
    .then((response) => {
      if (response.ok) {
        caches.open(SHELL_CACHE).then((cache) => cache.put(request, response));
      }
    })
    .catch(() => {
      // Silently ignore – we already served the cached version
    });
}

// ---- Background Sync: drain pending vitals queue ----

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-vitals") {
    event.waitUntil(syncPendingVitals());
  }
});

/**
 * Reads pending vitals from IndexedDB and POSTs each to the API.
 * On success, removes the entry from the store.
 *
 * This runs inside the service worker context, so we open IndexedDB directly
 * (the idb library is only available in the app; here we use raw IDB API).
 */
async function syncPendingVitals() {
  const db = await openHealthiaDB();
  const tx = db.transaction("pendingVitals", "readonly");
  const store = tx.objectStore("pendingVitals");
  const allEntries = await idbGetAll(store);

  for (const entry of allEntries) {
    try {
      const token = await getTokenFromIDB(db);
      if (!token) {
        // Can't sync without auth – stop trying
        console.warn("[SW sync] No auth token available, skipping sync.");
        break;
      }

      const res = await fetch(getApiUrl() + "/patients/vitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(entry.payload),
      });

      if (res.ok) {
        // Remove successfully synced entry
        const delTx = db.transaction("pendingVitals", "readwrite");
        delTx.objectStore("pendingVitals").delete(entry.id);
        await idbTxComplete(delTx);
      } else if (res.status === 401) {
        // Token expired – stop sync
        console.warn("[SW sync] Auth token expired, stopping sync.");
        break;
      }
      // Other errors: leave in queue for next attempt
    } catch {
      // Network still down or other error – stop, will retry later
      break;
    }
  }

  db.close();
}

// ---- Raw IndexedDB helpers for the SW context ----

function openHealthiaDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("healthia-offline", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("pendingVitals")) {
        db.createObjectStore("pendingVitals", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains("cachedData")) {
        db.createObjectStore("cachedData", { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGetAll(store) {
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbTxComplete(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Read the auth token stored in IDB by the app. */
async function getTokenFromIDB(db) {
  try {
    const tx = db.transaction("cachedData", "readonly");
    const store = tx.objectStore("cachedData");
    const entry = await new Promise((resolve, reject) => {
      const req = store.get("authToken");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return entry?.data ?? null;
  } catch {
    return null;
  }
}

/** Derive the API URL. We store it in cachedData during app init. */
function getApiUrl() {
  // Fallback – the app stores the real value in IDB
  return "http://localhost:3911";
}
