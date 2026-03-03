# Frontend (Next.js)

Medical Agent web app and embeddable widget.

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local: set API_URL to your backend URL (e.g. http://localhost:3911)
```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The index page shows dummy data and a widget in the bottom right. Click the "Hi" button to expand the widget and sign in (calls the backend auth API).

## Build

```bash
npm run build
npm run start
```

The index page (with dummy data and widget) is part of the default build output at `/`. Deploy the `.next` output (or your host’s build folder) to test in production; set `API_URL` to your deployed backend URL in the build environment.

## Env

| Variable | Description |
|---------|-------------|
| `API_URL` | Backend API base URL (e.g. `http://localhost:3911`). No trailing slash. Exposed to the client via `next.config.mjs` so the widget can call the backend. |

## Troubleshooting: Can't log in

- **"Cannot reach server"** – The frontend can't call the backend. Ensure:
  1. The backend is running (e.g. `cd backend && npm run start:dev`).
  2. `API_URL` matches the backend port. Backend default is **3011** (see `backend/src/main.ts` and `backend/.env.example`). In `.env.local` set `API_URL=http://localhost:3011` (or your backend URL).
  3. After changing env, restart the Next dev server and hard-refresh the browser.
- **"Invalid email or password"** – Credentials are wrong or the user doesn't exist. Register first at `/register`, or use existing credentials.
