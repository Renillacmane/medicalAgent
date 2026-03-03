# Cucumber (vanilla) BDD e2e

Vanilla [@cucumber/cucumber](https://github.com/cucumber/cucumber-js) for acceptance tests against the Nest API.

## Run

From the **backend** directory:

```bash
npm run test:cucumber
```

Requires the app to start successfully (e.g. MongoDB reachable, or override `DatabaseModule` in the support hooks for offline runs).

## Layout

- **`cucumber.config.cjs`** – paths to features, step definitions, and support (ts-node).
- **`features/`** – Gherkin `.feature` files.
- **`step-definitions/`** – TypeScript steps; use `ApiWorld` for `app` and `response`.
- **`support/`** – `world.ts` (shared state), `hooks.ts` (Before/After: start and close Nest app).

## Adding scenarios

1. Add or edit a `.feature` under `features/`.
2. Implement steps in `step-definitions/` (reuse or add new step files).
3. Run `npm run test:cucumber` from `backend/`.
