# Playwright Demo

A sample Playwright end-to-end testing project with example tests against [playwright.dev](https://playwright.dev/).

## Quick start

```bash
npm install
npx playwright install
npx playwright test
```

## Project structure

- `tests/` — Playwright test specs
- `playwright.config.ts` — Test runner configuration
- `readme/` — Additional project documentation

## Scripts

Run all tests:

```bash
npx playwright test
```

Open the HTML report after a test run:

```bash
npx playwright show-report
```

Run tests in UI mode:

```bash
npx playwright test --ui
```

## Browsers

Tests are configured to run on Chromium, Firefox, and WebKit. See `playwright.config.ts` for details.
