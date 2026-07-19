# Getting Started

This guide covers setup and running tests in the Playwright demo project.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm (included with Node.js)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/nitesh2k14/playwright-demo.git
   cd playwright-demo
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Install Playwright browsers:

   ```bash
   npx playwright install
   ```

## Running tests

Run the full test suite:

```bash
npx playwright test
```

Run a single test file:

```bash
npx playwright test tests/example.spec.ts
```

Run tests in headed mode (visible browser):

```bash
npx playwright test --headed
```

## Viewing results

After a test run, open the HTML report:

```bash
npx playwright show-report
```

Test artifacts are written to `test-results/` and `playwright-report/` (both ignored by git).

## Writing tests

Example tests live in `tests/example.spec.ts`. Add new `.spec.ts` files under `tests/` and Playwright will pick them up automatically.
