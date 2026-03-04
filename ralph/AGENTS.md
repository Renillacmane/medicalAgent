# How to build and validate

## Backend (backend/)

- Install: `npm install`
- Build: `npm run build`
- Unit tests: `npm run test`
- Lint: `npm run lint`
- E2E tests: `npm run test:e2e`

## Frontend (frontend/)

- Install: `npm install`
- Build: `npm run build`
- Lint: `npm run lint`

## Full validation (from repo root)

```bash
cd backend && npm run lint && npm run test && npm run build && cd ..
cd frontend && npm run lint && npm run build && cd ..
```

## Project structure

- Monorepo with `backend/` (NestJS + Fastify) and `frontend/` (Next.js + Capacitor)
- No root `package.json`; each app has its own dependencies and scripts
- Docs live in `docs/`; specs live in `specs/`
- `ralph/IMPLEMENTATION_PLAN.md` is the canonical task list (in ralph folder)
