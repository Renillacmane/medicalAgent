# Playwright E2E Tests

Browser-based end-to-end tests using [Playwright](https://playwright.dev/).

## Setup

From the **frontend** directory:

```bash
npm install
npx playwright install
```

The second command downloads browser binaries (Chromium, Firefox, WebKit).

## Run

**Headless (CI-style):**

```bash
npm run test:e2e
```

**Interactive UI mode:**

```bash
npm run test:e2e:ui
```

**Run specific test file:**

```bash
npx playwright test --config testes/playwright/playwright.config.ts tests/login.spec.ts
```

## Prerequisites

The frontend dev server must be running (or configure `webServer` in `playwright.config.ts`):

```bash
npm run dev
```

By default, tests hit `http://localhost:3000`. Override with `BASE_URL` env var:

```bash
BASE_URL=http://localhost:3001 npm run test:e2e
```

## Layout

```
testes/playwright/
├── playwright.config.ts   # Playwright configuration
├── fixtures/
│   └── index.ts           # Custom test fixtures (e.g., authenticated page)
├── tests/
│   └── login.spec.ts      # Test files
└── README.md
```

## Adding Tests

1. Create a new `.spec.ts` file under `tests/`.
2. Import from `@playwright/test` or from `../fixtures` for custom fixtures.
3. Run `npm run test:e2e` to execute.

## Reports

After running tests, an HTML report is generated. Open with:

```bash
npx playwright show-report
```
