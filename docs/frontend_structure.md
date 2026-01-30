# Frontend structure and layout options

## Overview

The Healthia frontend is a Next.js app that supports two presentation modes:

1. **Full app (PWA)** – The app runs as a full-page experience with real routes. Used when the app is opened directly (browser or installed PWA).
2. **Widget** – The app is shown inside a floating panel (rectangle + iframe). The same app (same routes and layout) loads inside the iframe; the widget is only a shell.

Layout components (header, footer, nav) are shared and layout-agnostic. They are not named after “widget” so they can be reused by any layout.

---

## Folder structure

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── (app)/              # Route group: app shell (header, footer, nav)
│   │   ├── layout.tsx      # Wraps children with AppShell
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── add/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing / test page (hosts Widget)
│   └── globals.css
├── components/              # Reusable UI
│   ├── layout/             # App chrome (shared by PWA and iframe content)
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── AppNav.tsx
│   │   ├── AboutModal.tsx
│   │   ├── AppShell.tsx    # Composes header, main, footer, nav, modal
│   │   └── nav-config.tsx
│   ├── ui/                 # Shared primitives (loading, fields)
│   │   ├── Spinner.tsx     # Loading spinner
│   │   ├── PageLoading.tsx # Spinner + optional message (used in pages and loading.tsx)
│   │   └── Field.tsx       # Definition-list field (profile, etc.)
│   ├── add/
│   │   └── AddVitalsForm.tsx
│   ├── Dashboard.tsx       # Page-level content components
│   ├── Add.tsx
│   ├── Profile.tsx
│   └── Widget.tsx          # Floating shell + iframe (one layout option)
├── pages/                  # Page-level forms / screens (not routes)
│   └── LoginForm.tsx       # (RegisterForm, etc. later)
├── types/                  # Shared TypeScript types (API responses, payloads)
│   ├── vital.ts            # Vital, BloodPressure, CreateVitalPayload
│   └── profile.ts           # PatientProfile, DietaryPreference, Objectives
└── lib/
    ├── config.ts           # Env-based config (e.g. API_URL)
    ├── api.ts              # Auth-backed fetch (authGet, authPost)
    ├── format.ts           # formatDate, todayISO (generic display helpers)
    └── vital-format.ts     # formatBP (vital-specific formatters)
```

- **`app/`** – Routes and layouts. `(app)` is a route group: its layout wraps `/dashboard`, `/add`, `/profile` with the shared shell.
- **`components/`** – Reusable components. `layout/` holds the app chrome; `Dashboard`, `Add`, `Profile` are content used by the app pages. `Widget` is one way to present the app (floating iframe).
- **`pages/`** – Form/screen components that represent full “pages” in the UI (e.g. LoginForm, RegisterForm). They are used by route pages or modals, not by the router directly.
- **`lib/`** – Shared utilities and config (`config.ts`, `api.ts` for auth-backed fetch).

---

## Data fetching and Next.js App Router

- **Pages** under `(app)/` are **Server Components** by default; they import Client Components (`Dashboard`, `Add`, `Profile`) that need interactivity or client-only state.
- **Auth** is token-based and stored in `localStorage` (client-only), so the server cannot send authenticated requests. Data fetching for profile and vitals is done in **Client Components** via `useEffect` and `lib/api.ts` (`authGet` / `authPost`).
- **Next.js patterns in use**:
  - **`loading.tsx`** – Route-level loading UI for `(app)`, `dashboard`, and `profile`. Each file imports the shared **`PageLoading`** component (spinner + message) so route-level and in-page loading look the same and there’s no duplicate markup.
  - **`error.tsx`** – Error boundary for the `(app)` group with "Try again" (`reset()`).
- **Loading in the page**: Dashboard and Profile show **`PageLoading`** (spinner + message) when fetching data, so the loading state lives in the page itself; `loading.tsx` only covers the brief route/chunk load and reuses the same component.
- **Alternative (full server-side)**: If auth used an httpOnly cookie, we could fetch in Server Components and use **Server Actions** for mutations (e.g. POST vitals) and drop client-side fetch for initial data.

---

## Code organization (types, format, ui)

- **`types/`** – Shared TypeScript types for API responses and payloads (`Vital`, `PatientProfile`, `CreateVitalPayload`, etc.). Keeps components free of inline type definitions.
- **`lib/format.ts`** – Generic display helpers: `formatDate(s, style)`, `todayISO()`.
- **`lib/vital-format.ts`** – Vital-specific formatters (e.g. `formatBP`) so Dashboard and others don’t define them inline.
- **`components/ui/`** – Shared primitives: **Spinner**, **PageLoading** (spinner + optional message), **Field** (key/value row for profile). Used by pages and by `loading.tsx` so loading UI is consistent and not duplicated.

---

## Layout options

### 1. PWA / full app

- **When**: User opens the app in the browser or as an installed PWA.
- **How**: Next.js routes under `(app)` render the full layout via `AppShell` (Header, main content, Footer, AppNav, AboutModal).
- **URLs**: `/dashboard`, `/add`, `/profile` (and optionally `/` for a landing or redirect).
- **Navigation**: Real routing with `<Link>` and `usePathname()` in `AppNav`. Back/forward and deep links work.

### 2. Widget (floating iframe)

- **When**: The app is embedded as a floating panel (e.g. on a landing page or partner site).
- **How**: The **Widget** component is a thin shell: a rectangle, a close button, and an **iframe** whose `src` points at the app (e.g. `/dashboard`). The iframe loads the **full app** (same layout and routes) inside the panel. There is no duplicate chrome or nav logic in the widget.
- **Navigation**: Happens inside the iframe (same Next.js routes and AppNav). The widget does not handle routes; it only provides the frame and close.
- **Config**: For same-origin use, iframe `src` is relative (e.g. `/dashboard`). For embedding on another origin, set `NEXT_PUBLIC_APP_URL` (or pass `embedBaseUrl` to `Widget`) so the iframe points at the deployed app URL.

---

## Removed / unused

- **`components/views/`** – Removed. Former “view” components were renamed and moved to `components/` (Dashboard, Add, Profile).
- **`components/widget/`** – Removed. Layout pieces were moved to `components/layout/`; the widget is now a single component (`Widget.tsx`) that only renders a shell + iframe.
- **`app/dashboard`** (top-level) – Not used. Dashboard lives under the `(app)` group as `app/(app)/dashboard/` (route `/dashboard`).

---

## Config

- **API base URL**: `lib/config.ts` exports `apiUrl` from `process.env.API_URL` (fallback `http://localhost:3911`). Used by LoginForm and any other client code that calls the backend. Ensure `API_URL` is available to the client (e.g. via next.config or your deployment env).
